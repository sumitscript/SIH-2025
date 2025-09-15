import os
import sys
import subprocess
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("server_runner.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("server_runner")

def check_python_installation():
    """Check if Python is installed and accessible"""
    try:
        # Check Python version
        process = subprocess.run(
            ["python", "--version"], 
            capture_output=True, 
            text=True
        )
        if process.returncode == 0:
            logger.info(f"Python found: {process.stdout.strip()}")
            return True
        else:
            # Try with python3 command
            process = subprocess.run(
                ["python3", "--version"], 
                capture_output=True, 
                text=True
            )
            if process.returncode == 0:
                logger.info(f"Python3 found: {process.stdout.strip()}")
                return True
            else:
                logger.error("Python not found. Please install Python 3.7 or higher.")
                return False
    except Exception as e:
        logger.error(f"Error checking Python installation: {str(e)}")
        return False

def install_requirements():
    """Install required Python packages"""
    try:
        requirements_path = os.path.join(os.path.dirname(__file__), "requirements.txt")
        if not os.path.exists(requirements_path):
            logger.error(f"Requirements file not found at {requirements_path}")
            return False
        
        logger.info("Installing required packages...")
        process = subprocess.run(
            ["pip", "install", "-r", requirements_path],
            capture_output=True,
            text=True
        )
        
        if process.returncode == 0:
            logger.info("Required packages installed successfully")
            return True
        else:
            logger.error(f"Error installing packages: {process.stderr}")
            # Try with pip3
            process = subprocess.run(
                ["pip3", "install", "-r", requirements_path],
                capture_output=True,
                text=True
            )
            if process.returncode == 0:
                logger.info("Required packages installed successfully using pip3")
                return True
            else:
                logger.error(f"Error installing packages with pip3: {process.stderr}")
                return False
    except Exception as e:
        logger.error(f"Error installing requirements: {str(e)}")
        return False

def generate_mock_data():
    """Generate mock data for testing"""
    try:
        logger.info("Generating mock data for testing...")
        mock_data_script = os.path.join(os.path.dirname(__file__), "generate_mock_data.py")
        if not os.path.exists(mock_data_script):
            logger.error(f"Mock data generation script not found at {mock_data_script}")
            return False
        
        process = subprocess.run(
            ["python", mock_data_script],
            capture_output=True,
            text=True
        )
        
        if process.returncode == 0:
            logger.info("Mock data generated successfully")
            return True
        else:
            logger.error(f"Error generating mock data: {process.stderr}")
            # Try with python3
            process = subprocess.run(
                ["python3", mock_data_script],
                capture_output=True,
                text=True
            )
            if process.returncode == 0:
                logger.info("Mock data generated successfully using python3")
                return True
            else:
                logger.error(f"Error generating mock data with python3: {process.stderr}")
                return False
    except Exception as e:
        logger.error(f"Error generating mock data: {str(e)}")
        return False

def run_server():
    """Run the Flask API server"""
    try:
        logger.info("Starting ML API server...")
        server_script = os.path.join(os.path.dirname(__file__), "api_server.py")
        if not os.path.exists(server_script):
            logger.error(f"API server script not found at {server_script}")
            return False
        
        # Run the server
        process = subprocess.Popen(
            ["python", server_script],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        logger.info(f"Server started with PID {process.pid}")
        logger.info("ML API server is running at http://localhost:5000")
        
        # Monitor server output
        while True:
            output = process.stdout.readline()
            if output:
                print(output.strip())
            
            error = process.stderr.readline()
            if error:
                print(f"ERROR: {error.strip()}", file=sys.stderr)
            
            # Check if process is still running
            if process.poll() is not None:
                logger.error(f"Server process exited with code {process.returncode}")
                remaining_output, remaining_error = process.communicate()
                if remaining_output:
                    print(remaining_output.strip())
                if remaining_error:
                    print(f"ERROR: {remaining_error.strip()}", file=sys.stderr)
                break
            
            time.sleep(0.1)
        
        return process.returncode == 0
    except Exception as e:
        logger.error(f"Error running server: {str(e)}")
        return False

def main():
    """Main function to run the ML server"""
    logger.info("Starting ML server setup...")
    
    # Check Python installation
    if not check_python_installation():
        logger.error("Python check failed. Exiting.")
        return 1
    
    # Install requirements
    if not install_requirements():
        logger.error("Failed to install requirements. Exiting.")
        return 1
    
    # Generate mock data
    if not generate_mock_data():
        logger.warning("Failed to generate mock data. Continuing anyway...")
    
    # Run the server
    if not run_server():
        logger.error("Failed to run server. Exiting.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())