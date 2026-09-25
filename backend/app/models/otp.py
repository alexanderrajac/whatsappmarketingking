from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime
from app.core.database import Base

class OtpRecord(Base):
    __tablename__ = "otp_records"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True, nullable=False)
    otp_code_hash = Column(String, nullable=False)
    otp_preview = Column(String, nullable=True)  # e.g., '58**' for audit
    app_name = Column(String, default="Web Platform", index=True)
    purpose = Column(String, default="LOGIN")  # LOGIN, SIGNUP, ORDER_VERIFY, PASSWORD_RESET
    status = Column(String, default="PENDING", index=True)  # PENDING, VERIFIED, EXPIRED, FAILED
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    ip_address = Column(String, nullable=True)
    whatsapp_message_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Unavukadai Food App"
    key = Column(String, unique=True, index=True, nullable=False)  # wa_live_...
    key_prefix = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)
