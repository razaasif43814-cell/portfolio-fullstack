"""
Email Helper — SMTP email utilities with robust fallback
Supports Gmail SMTP with App Password.
Falls back to storing messages in DB when SMTP is not configured.
"""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config


def _smtp_available():
    """Check if SMTP credentials are configured."""
    return bool(Config.GMAIL_USER and Config.GMAIL_PASS)


def _send_smtp(msg, to_email):
    """Send email via Gmail SMTP with proper SSL handling."""
    context = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context, timeout=15) as server:
            server.login(Config.GMAIL_USER, Config.GMAIL_PASS)
            server.sendmail(Config.GMAIL_USER, to_email, msg.as_string())
        return True, None
    except smtplib.SMTPAuthenticationError:
        return False, "SMTP auth failed — check GMAIL_PASS (needs App Password, not regular password)"
    except smtplib.SMTPException as e:
        return False, f"SMTP error: {e}"
    except Exception as e:
        return False, f"Email send error: {e}"


def send_contact_email(from_name, from_email, subject, message_body):
    """Send contact form email via Gmail SMTP.
    
    Returns (success: bool, message: str)
    Message is always stored in DB by the caller (app.py).
    This function only handles the email notification.
    """
    if not _smtp_available():
        print(f"[CONTACT] No SMTP configured — message saved to DB only")
        print(f"  From: {from_name} <{from_email}>")
        print(f"  Subject: {subject}")
        print(f"  Message: {message_body[:200]}")
        return True, "Message received successfully! (Email notification pending setup)"

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

        ok, err = _send_smtp(msg, Config.TO_EMAIL or Config.GMAIL_USER)
        if ok:
            return True, "Message sent successfully!"
        else:
            print(f"[CONTACT ERROR] {err}")
            return True, "Message saved! (Email delivery pending)"

    except Exception as e:
        print(f"[CONTACT ERROR] {e}")
        return True, "Message saved! (Email delivery pending)"


def send_reset_email(to_email, reset_url):
    """Send password reset email.
    
    Returns True if sent (or gracefully handled), False on hard failure.
    """
    if not _smtp_available():
        print(f"[RESET] No SMTP configured")
        print(f"  To: {to_email}")
        print(f"  Reset URL: {reset_url}")
        print(f"  ⚠️  User cannot reset password until GMAIL_PASS is set!")
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
          <hr style="border:none;border-top:1px solid #333;margin:20px 0;">
          <p style="color:#444;font-size:11px;">If the button doesn't work, copy this link:<br>
            <a href="{reset_url}" style="color:#854ce6;word-break:break-all;">{reset_url}</a>
          </p>
        </div>"""

        msg.attach(MIMEText(html_body, "html"))

        ok, err = _send_smtp(msg, to_email)
        if ok:
            return True
        else:
            print(f"[RESET EMAIL ERROR] {err}")
            return False

    except Exception as e:
        print(f"[RESET EMAIL ERROR] {e}")
        return False
