# Security Best Practices

## Handling Sensitive Information

### Environment Variables

This project uses environment variables to store sensitive information such as API keys, database credentials, and OAuth secrets. This approach helps prevent accidental exposure of sensitive data in version control systems.

### How to Set Up Environment Variables

1. Copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to add your actual credentials:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   ...
   ```

3. Make sure the `.env` file is included in `.gitignore` to prevent it from being committed to the repository.

### Never Commit Sensitive Information

- **NEVER** commit the `.env` file to version control
- **NEVER** hardcode sensitive information in PHP files, JavaScript files, or any other source code files
- **NEVER** include sensitive information in comments

## GitHub Security Features

GitHub has security features that can detect accidentally committed secrets:

1. **Secret Scanning**: GitHub scans repositories for known types of secrets to prevent fraudulent use of credentials that were committed accidentally.

2. **Push Protection**: GitHub can block pushes that contain sensitive information.

If you encounter a message like this when pushing to GitHub:

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - GITHUB PUSH PROTECTION
```

It means GitHub has detected sensitive information in your commit. You should:

1. Remove the sensitive information from your code
2. Use environment variables instead
3. Update your commit history to remove the sensitive information

## How to Fix Exposed Secrets

If you accidentally commit sensitive information:

1. **Change your credentials immediately** - Consider any exposed credentials compromised
2. **Remove the sensitive information** from your codebase and replace with environment variables
3. **Update your Git history** to remove the sensitive information

### Updating Git History

To remove sensitive information from your Git history, you can use the following commands:

```bash
# For a specific file
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch path/to/file" HEAD

# Or use BFG Repo-Cleaner (recommended for large repositories)
# https://rtyley.github.io/bfg-repo-cleaner/
```

## Additional Security Recommendations

1. **Use HTTPS** for all external connections
2. **Validate all user inputs** to prevent injection attacks
3. **Keep dependencies updated** to avoid known vulnerabilities
4. **Implement proper authentication and authorization** mechanisms
5. **Use prepared statements** for database queries to prevent SQL injection