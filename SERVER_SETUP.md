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

The `.htaccess` file in `public/` directory should NOT have RewriteBase if your document root points to `public/`.

**If document root is `/system/public/`:**
- Remove RewriteBase line (already done)
- Routes will work as: `https://sdhds.net/system/public/login`

**If document root is `/system/` and you access via `/system/public/`:**
- You may need RewriteBase, but first try without it

### 4. Test URLs

After configuration, these URLs should work:
- `https://sdhds.net/system/public/login` - Should show login page (currently 404)
- `https://sdhds.net/system/public/admin` - Should redirect to login if not authenticated (currently 403)
- `https://sdhds.net/system/public/` - Home page (this works based on your screenshot)

### 5. Troubleshooting 404 on /login

If `/login` still gives 404, check:

1. **Verify routes are registered:**
   ```bash
   php artisan route:list | grep login
   ```

2. **Check if document root is correct:**
   - Document root should point to: `/path/to/system/public/`
   - NOT to: `/path/to/system/`

3. **Test with a simple route:**
   ```bash
   # Add this to routes/web.php temporarily:
   Route::get('/test-route-123', function() {
       return 'Routes are working!';
   });
   ```
   Then test: `https://sdhds.net/system/public/test-route-123`

### 6. Troubleshooting 403 on /admin

403 Forbidden usually means:
- Route is found but middleware is blocking
- File permissions issue
- Web server blocking the request

**To test if it's auth middleware:**
- Temporarily remove `->middleware('auth')` from admin route
- If it works, the issue is authentication
- If still 403, it's a server/permission issue

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

