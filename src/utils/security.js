import fs from 'fs';
import path from 'path';

export class SecurityManager {
  static maskSensitiveFiles() {
    const sensitiveFiles = ['.env', '.env.local', '.env.production'];
    
    sensitiveFiles.forEach(filename => {
      try {
        const filepath = path.join(process.cwd(), filename);
        if (fs.existsSync(filepath)) {
          // Change permissions to owner-read-only
          fs.chmodSync(filepath, 0o600);
          console.log(`🔒 Secured ${filename}`);
        }
      } catch (error) {
        // Fail silently - file may not exist or permissions may not be changeable
      }
    });
  }

  static checkEnvironmentSecurity() {
    const warnings = [];
    
    // Check for exposed secrets
    const envContent = process.env;
    Object.keys(envContent).forEach(key => {
      if (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN')) {
        const value = envContent[key];
        if (value && value.length > 10 && !value.includes('your-') && !value.includes('example')) {
          // Mask the value in logs
          envContent[key + '_DISPLAY'] = value.substring(0, 4) + '***' + value.slice(-3);
        }
      }
    });

    return warnings;
  }
}
