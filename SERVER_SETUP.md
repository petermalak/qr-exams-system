# Server Configuration for Subdirectory Installation

## Issue
Application is installed in subdirectory: `https://sdhds.net/system/public/`

## Required Server Configuration

### 1. Update .env file on server

Add or update these values in your `.env` file on the server:

```env
APP_URL=https://sdhds.net/system/public
```

### 2. Clear all caches on server

Run these commands on the server:

```bash
cd /path/to/your/project
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear
php artisan optimize:clear
```

### 3. Verify .htaccess

The `.htaccess` file in `public/` directory should have:
```
RewriteBase /system/public/
```

### 4. Test URLs

After configuration, these URLs should work:
- `https://sdhds.net/system/public/login`
- `https://sdhds.net/system/public/admin`
- `https://sdhds.net/system/public/` (home page)

### 5. Alternative: If RewriteBase doesn't work

If the RewriteBase approach doesn't work, you may need to:

1. **Option A**: Move the Laravel application so `public/` is the document root
   - Point web server document root to: `/path/to/system/public/`
   - Update paths in `.env` accordingly

2. **Option B**: Use a different RewriteBase or remove it and rely on APP_URL
   - Remove `RewriteBase` line from `.htaccess`
   - Ensure `APP_URL` in `.env` is: `https://sdhds.net/system/public`

### 6. Check Web Server Configuration

**For Apache:**
- Ensure `mod_rewrite` is enabled
- Document root should point to `/path/to/system/public/` OR
- Use Alias directive if keeping current structure

**For Nginx:**
- Update `root` directive to point to `public` directory
- Update `try_files` directive

