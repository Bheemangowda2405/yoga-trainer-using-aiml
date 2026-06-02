import os

bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = 1
threads = 2
timeout = 180
capture_output = True
accesslog = "-"
errorlog = "-"
loglevel = os.getenv('LOG_LEVEL', 'info')
preload_app = False
