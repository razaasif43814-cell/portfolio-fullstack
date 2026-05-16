"""
Email Helper — SMTP email utilities
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config


def send_contact_email(from_name, from_email, subject, message_body):
    """Send contact form email via Gmail SMTP."""
    if not Config.GMAIL_PASS:
        print(f"[CONTACT - No SMTP] From: {from_email} | {subject}\n{message_body}")
        return True, "Message received! (Email not configured yet)"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[Portfolio] {subject} – from {from_name}"
        msg["From"] = Config.GMAIL_USER
        msg["To"] = Config.TO_EMAIL or Config.GMAIL_USER
        msg["Reply-To"] = from_email

        html_body = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;padding:20px;background:#0a0a1a;color:#fff;border-radius:12px;">
          <h2 style="color:#854ce6;">📩 New Portfolio Message</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;color:#aaa;width:100px;">Name</td><td style="padding:8px;color:#fff;">{from_name}</td></tr>
            <tr><td style="padding:8px;color:#aaa;">Email</td><td style="padding:8px;color:#854ce6;">{from_email}</td></tr>
            <tr><td style="padding:8px;color:#aaa;">Subject</td><td style="padding:8px;color:#fff;">{subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#1a1a2e;border-left:4px solid #854ce6;border-radius:6px;">
            <p style="color:#eee;line-height:1.6;">{message_body}</p>
          </div>
          <p style="color:#555;font-size:12px;margin-top:20px;">Sent via Asif Raza Portfolio Website</p>
        </div>"""

        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(Config.GMAIL_USER, Config.GMAIL_PASS)
            server.sendmail(Config.GMAIL_USER, Config.TO_EMAIL or Config.GMAIL_USER, msg.as_string())

        return True, "Message sent successfully!"
    except Exception as e:
        print(f"[CONTACT ERROR] {e}")
        return False, "Failed to send. Please try again."


def send_reset_email(to_email, reset_url):
    """Send password reset email."""
    if not Config.GMAIL_PASS:
        print(f"[RESET - No SMTP] To: {to_email} | URL: {reset_url}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Password Reset — Asif Raza Portfolio"
        msg["From"] = Config.GMAIL_USER
        msg["To"] = to_email

        html_body = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;padding:20px;background:#0a0a1a;color:#fff;border-radius:12px;">
          <h2 style="color:#854ce6;">🔐 Password Reset Request</h2>
          <p style="color:#ccc;line-height:1.6;">You requested a password reset. Click the button below to set a new password:</p>
          <a href="{reset_url}" style="display:inline-block;margin:20px 0;padding:14px 32px;background:linear-gradient(225deg,#854ce6,#cc00bb);color:#fff;text-decoration:none;border-radius:50px;font-weight:600;">
            Reset Password
          </a>
          <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>"""

        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(Config.GMAIL_USER, Config.GMAIL_PASS)
            server.sendmail(Config.GMAIL_USER, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"[RESET EMAIL ERROR] {e}")
        return False
