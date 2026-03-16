//! Dorker Verify — Chrome Native Messaging Email Verifier
//! Reads JSON from stdin, writes verification results to stdout
//! Protocol: Chrome Native Messaging (4-byte length prefix, JSON payload)

mod disposable;
mod verifier;

use byteorder::{NativeEndian, ReadBytesExt, WriteBytesExt};
use serde::{Deserialize, Serialize};
use std::io::{self, Read, Write};
use verifier::{VerifyRequest, VerifyResult};

/// Incoming message from Chrome extension
#[derive(Debug, Deserialize)]
#[serde(tag = "action")]
enum IncomingMessage {
    #[serde(rename = "VERIFY_EMAIL")]
    VerifyEmail { email: String, #[serde(default)] skip_smtp: bool },
    #[serde(rename = "VERIFY_BATCH")]
    VerifyBatch { emails: Vec<String>, #[serde(default)] skip_smtp: bool },
    #[serde(rename = "PING")]
    Ping,
}

/// Outgoing message to Chrome extension
#[derive(Debug, Serialize)]
struct OutgoingMessage {
    action: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    result: Option<VerifyResult>,
    #[serde(skip_serializing_if = "Option::is_none")]
    results: Option<Vec<VerifyResult>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    version: Option<String>,
}

/// Read a native messaging message (4-byte length + JSON)
fn read_message() -> io::Result<Option<String>> {
    let mut stdin = io::stdin().lock();
    
    // Read 4-byte length prefix
    let length = match stdin.read_u32::<NativeEndian>() {
        Ok(len) => len as usize,
        Err(e) if e.kind() == io::ErrorKind::UnexpectedEof => return Ok(None),
        Err(e) => return Err(e),
    };

    if length == 0 || length > 1_048_576 {
        return Ok(None); // Invalid or too large
    }

    // Read JSON payload
    let mut buffer = vec![0u8; length];
    stdin.read_exact(&mut buffer)?;
    
    String::from_utf8(buffer)
        .map(Some)
        .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))
}

/// Write a native messaging message (4-byte length + JSON)
fn write_message(msg: &OutgoingMessage) -> io::Result<()> {
    let json = serde_json::to_string(msg)
        .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
    
    let mut stdout = io::stdout().lock();
    stdout.write_u32::<NativeEndian>(json.len() as u32)?;
    stdout.write_all(json.as_bytes())?;
    stdout.flush()?;
    
    Ok(())
}

/// Send error response
fn send_error(error: &str) {
    let _ = write_message(&OutgoingMessage {
        action: "ERROR".into(),
        result: None,
        results: None,
        error: Some(error.into()),
        version: None,
    });
}

/// Send pong response
fn send_pong() {
    let _ = write_message(&OutgoingMessage {
        action: "PONG".into(),
        result: None,
        results: None,
        error: None,
        version: Some("1.0.0".into()),
    });
}

fn main() {
    // Create tokio runtime for async SMTP/DNS
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .worker_threads(4)
        .build()
        .expect("Failed to create tokio runtime");

    // Main message loop — read from stdin, process, write to stdout
    loop {
        match read_message() {
            Ok(Some(json)) => {
                match serde_json::from_str::<IncomingMessage>(&json) {
                    Ok(IncomingMessage::Ping) => {
                        send_pong();
                    }
                    Ok(IncomingMessage::VerifyEmail { email, skip_smtp }) => {
                        let req = VerifyRequest { email, skip_smtp };
                        let result = rt.block_on(verifier::verify_email(&req));
                        let _ = write_message(&OutgoingMessage {
                            action: "VERIFY_RESULT".into(),
                            result: Some(result),
                            results: None,
                            error: None,
                            version: None,
                        });
                    }
                    Ok(IncomingMessage::VerifyBatch { emails, skip_smtp }) => {
                        let results = rt.block_on(async {
                            let mut handles = Vec::new();
                            // Process in parallel (max 10 concurrent)
                            for chunk in emails.chunks(10) {
                                let chunk_handles: Vec<_> = chunk.iter().map(|email| {
                                    let req = VerifyRequest {
                                        email: email.clone(),
                                        skip_smtp,
                                    };
                                    tokio::spawn(async move {
                                        verifier::verify_email(&req).await
                                    })
                                }).collect();
                                
                                for handle in chunk_handles {
                                    if let Ok(result) = handle.await {
                                        handles.push(result);
                                    }
                                }
                            }
                            handles
                        });
                        
                        let _ = write_message(&OutgoingMessage {
                            action: "VERIFY_BATCH_RESULT".into(),
                            result: None,
                            results: Some(results),
                            error: None,
                            version: None,
                        });
                    }
                    Err(e) => {
                        send_error(&format!("Invalid message: {}", e));
                    }
                }
            }
            Ok(None) => break, // EOF — Chrome closed the connection
            Err(e) => {
                send_error(&format!("Read error: {}", e));
                break;
            }
        }
    }
}
