# Code Signing Guide for DevControl

## Overview

Code signing is the process of digitally signing executables and scripts to confirm the software author and guarantee that the code has not been altered or corrupted since it was signed. For Windows applications built with Electron, this prevents SmartScreen warnings and establishes trust with users.

---

## Do You Need Code Signing?

### ✅ **You NEED Code Signing If:**
- Distributing to external users/customers
- Publishing on Microsoft Store
- Enterprise deployment (IT departments often require it)
- Building commercial software
- Want to avoid "Windows protected your PC" warnings for users

### ❌ **You DON'T Need Code Signing If:**
- Personal use only
- Internal development/testing
- Open-source projects with technical users
- Prototyping or MVP stage
- Budget constraints (certificates cost $100-400/year)

---

## Code Signing Certificate Providers

### Recommended Certificate Authorities (CAs)

| Provider | Cost/Year | Verification Time | Notes |
|----------|-----------|-------------------|-------|
| **DigiCert** | ~$400 | 1-3 days | Most trusted, industry standard, fastest support |
| **Sectigo** (formerly Comodo) | ~$200 | 3-5 days | Good balance of cost and reliability |
| **GlobalSign** | ~$250 | 2-4 days | Strong reputation, good for international |
| **SSL.com** | ~$200 | 3-7 days | Budget-friendly, good documentation |
| **Certum** | ~$100 | 5-10 days | Cheapest option, longer verification |

### Types of Certificates

1. **Standard Code Signing Certificate**
   - Stored as a file (.pfx or .p12)
   - Can be copied/backed up
   - Less expensive
   - **Risk**: Can be stolen if not secured properly

2. **EV (Extended Validation) Code Signing Certificate**
   - Stored on a hardware USB token
   - Cannot be copied
   - More expensive (~$300-500/year)
   - **Benefit**: Instant SmartScreen reputation (no warnings from day 1)
   - **Recommended for**: Commercial software distribution

---

## The Certificate Purchase Process

### Step 1: Choose a Provider
Select a CA from the list above based on your budget and timeline.

### Step 2: Purchase the Certificate
- Visit the CA's website
- Select "Code Signing Certificate" (or "EV Code Signing" for hardware token)
- Complete the purchase

### Step 3: Identity Verification
The CA will verify your identity. Requirements vary but typically include:

**For Individuals:**
- Government-issued photo ID (passport, driver's license)
- Phone verification call
- Proof of address (utility bill, bank statement)
- Processing time: 1-7 days

**For Businesses:**
- Business registration documents
- D-U-N-S number (or equivalent)
- Phone verification to listed business number
- Authorized representative verification
- Processing time: 3-14 days

### Step 4: Receive Certificate
- **Standard Certificate**: Download .pfx file and password via email
- **EV Certificate**: USB token shipped to verified business address

### Step 5: Secure Storage
- **Standard**: Store .pfx file securely, use strong password
- **EV**: Keep USB token in safe location, never share

---

## Configuring electron-builder for Code Signing

### Current Configuration (No Signing)

```json
{
  "build": {
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico",
      "forceCodeSigning": false
    }
  }
}
```

### Configuration WITH Code Signing Certificate

#### Option 1: Using Environment Variables (Recommended)

```json
{
  "build": {
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico",
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": null,
      "signingHashAlgorithms": ["sha256"],
      "signDlls": true
    }
  }
}
```

**Set environment variables before building:**
```powershell
$env:CSC_LINK = "C:\path\to\certificate.pfx"
$env:CSC_KEY_PASSWORD = "your-certificate-password"
npm run dist
```

#### Option 2: Direct Configuration (Less Secure)

```json
{
  "build": {
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico",
      "certificateFile": "./certs/mycert.pfx",
      "certificatePassword": "MySecurePassword123",
      "signingHashAlgorithms": ["sha256"],
      "signDlls": true
    }
  }
}
```

⚠️ **Warning**: Never commit certificate passwords to version control!

#### Option 3: Using Azure Key Vault (Enterprise)

```json
{
  "build": {
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico",
      "azureSignOptions": {
        "endpoint": "https://your-vault.vault.azure.net/",
        "certificateName": "your-cert-name"
      }
    }
  }
}
```

---

## Building SmartScreen Reputation

Even with a valid code signing certificate, Windows SmartScreen may still show warnings initially. This is because Microsoft tracks the **reputation** of your certificate.

### How Reputation Works:
1. **New Certificate**: SmartScreen warnings appear even with valid signature
2. **Building Trust**: As more users download and run your app without issues, reputation increases
3. **Established Reputation**: After ~3,000-10,000 downloads over several weeks, warnings disappear

### EV Certificates Bypass This:
- EV (Extended Validation) certificates get **instant reputation**
- No SmartScreen warnings from day 1
- Worth the extra cost for commercial software

---

## Certificate Renewal

### Important Notes:
- Certificates expire (typically after 1-3 years)
- You must renew before expiration
- **Old signatures remain valid** even after certificate expires
- Plan for renewal 30 days before expiration

### Renewal Process:
1. Purchase renewal from same CA (usually discounted)
2. Re-verify identity (often faster than initial verification)
3. Receive new certificate
4. Update configuration with new certificate
5. Rebuild and re-sign all new releases

---

## Security Best Practices

### Protecting Your Certificate

1. **Never commit certificates to Git**
   ```gitignore
   # Add to .gitignore
   *.pfx
   *.p12
   certs/
   ```

2. **Use environment variables** for passwords
   ```powershell
   # Set in your build environment only
   $env:CSC_KEY_PASSWORD = "password"
   ```

3. **Restrict file permissions** on certificate files
   ```powershell
   # Windows: Right-click .pfx → Properties → Security
   # Remove all users except yourself
   ```

4. **Backup securely**
   - Store backup in encrypted archive
   - Use password manager for certificate password
   - Keep backup offline or in secure cloud storage

5. **For EV certificates**: Physical security of USB token is critical

---

## Troubleshooting Common Issues

### "Cannot find certificate" Error
```bash
# Verify certificate path
Test-Path "C:\path\to\certificate.pfx"

# Check environment variable
echo $env:CSC_LINK
```

### "Invalid password" Error
```bash
# Test certificate password
certutil -dump "C:\path\to\certificate.pfx"
# Enter password when prompted
```

### "Certificate has expired"
```bash
# Check certificate validity
certutil -dump "C:\path\to\certificate.pfx" | Select-String "NotAfter"
```

### Build Fails with Code Signing
```json
// Temporarily disable to test
{
  "win": {
    "forceCodeSigning": false
  }
}
```

---

## Cost-Benefit Analysis

### Without Code Signing (Current Setup)
**Pros:**
- ✅ Free
- ✅ No verification delays
- ✅ Simple configuration
- ✅ Works fine for personal use

**Cons:**
- ❌ SmartScreen warnings for users
- ❌ Looks unprofessional
- ❌ Users must click "More info" → "Run anyway"
- ❌ Some antivirus may flag unsigned executables

### With Standard Code Signing (~$200/year)
**Pros:**
- ✅ Verified publisher identity
- ✅ Professional appearance
- ✅ Tamper detection
- ✅ Eventually builds SmartScreen reputation

**Cons:**
- ❌ Annual cost
- ❌ Initial SmartScreen warnings (until reputation builds)
- ❌ Certificate management overhead

### With EV Code Signing (~$400/year)
**Pros:**
- ✅ All benefits of standard signing
- ✅ **Instant SmartScreen reputation** (no warnings)
- ✅ Hardware token prevents theft
- ✅ Best for commercial distribution

**Cons:**
- ❌ Higher annual cost
- ❌ Longer verification process
- ❌ Hardware token can be lost/damaged
- ❌ More complex setup

---

## Recommendations for DevControl

### Current Status: ✅ **No Code Signing (Appropriate)**
Since DevControl is currently for personal use, code signing is not necessary.

### When to Consider Code Signing:

1. **Public Release** (Standard Certificate)
   - If you plan to distribute DevControl publicly
   - Budget: ~$200/year
   - Timeline: Start 2-3 weeks before release

2. **Commercial Product** (EV Certificate)
   - If monetizing or enterprise deployment
   - Budget: ~$400/year
   - Timeline: Start 4-6 weeks before release

3. **Open Source Project** (Optional)
   - Consider if user base grows significantly
   - Some CAs offer discounts for open source
   - Community might sponsor certificate costs

---

## Quick Reference Commands

### Check if Developer Mode is Enabled (for building)
```powershell
Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" -Name AllowDevelopmentWithoutDevLicense
```

### Enable Developer Mode (required for unsigned builds)
```powershell
Start-Process ms-settings:developers
# Toggle "Developer Mode" to ON
```

### Build Without Code Signing
```powershell
npm run dist
```

### Build With Code Signing (when you have certificate)
```powershell
$env:CSC_LINK = "C:\path\to\certificate.pfx"
$env:CSC_KEY_PASSWORD = "your-password"
npm run dist
```

### Verify Signature of Built EXE
```powershell
Get-AuthenticodeSignature "dist-electron\DevControl Setup 0.0.0.exe"
```

---

## Additional Resources

- [electron-builder Code Signing Docs](https://www.electron.build/code-signing)
- [Microsoft SmartScreen Documentation](https://docs.microsoft.com/en-us/windows/security/threat-protection/microsoft-defender-smartscreen/)
- [DigiCert Code Signing Guide](https://www.digicert.com/code-signing/)
- [SSL.com Code Signing Tutorial](https://www.ssl.com/how-to/code-signing-certificates/)

---

## Document Version
- **Created**: 2026-01-02
- **Last Updated**: 2026-01-02
- **Applies To**: DevControl v0.0.0+
- **Author**: Development Team

---

**Next Steps**: Enable Windows Developer Mode and rebuild to get your custom icon working! 🚀
