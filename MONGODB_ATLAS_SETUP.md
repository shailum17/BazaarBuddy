# MongoDB Atlas Setup Guide for BazaarBuddy

## Step-by-Step MongoDB Atlas Configuration

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create your account with email and password

### 2. Create a Cluster

1. **Choose Plan**: Select "FREE" tier (M0)
2. **Cloud Provider**: Choose AWS, Google Cloud, or Azure (any is fine)
3. **Region**: Select the closest region to you
4. **Cluster Name**: Use default or name it "bazaarbuddy-cluster"
5. Click "Create Cluster"

### 3. Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. **Authentication Method**: Choose "Password"
4. **Username**: Create a username (e.g., "bazaarbuddy-user")
5. **Password**: Create a strong password (save this!)
6. **Database User Privileges**: Select "Read and write to any database"
7. Click "Add User"

### 4. Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. **Access List Entry**: 
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP address
4. Click "Confirm"

### 5. Get Your Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. **Driver**: Node.js
4. **Version**: 5.0 or later
5. Copy the connection string

### 6. Configure Your Application

1. **Update your `.env` file** in the server directory:

```env
# Replace the placeholder values with your actual values
MONGODB_URI=mongodb+srv://bazaarbuddy-user:your_password@cluster0.abc123.mongodb.net/bazaarbuddy?retryWrites=true&w=majority
```

**Important**: Replace:
- `bazaarbuddy-user` with your actual username
- `your_password` with your actual password
- `cluster0.abc123` with your actual cluster identifier

### 7. Test the Connection

Run the setup script to test your connection:

```bash
cd server
npm run setup
```

You should see:
```
✅ MongoDB Atlas connection successful!
📦 Connected to: cluster0.abc123.mongodb.net
🗄️  Database: bazaarbuddy
✅ Connection test completed successfully
```

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check username and password in connection string
   - Verify the user exists in Database Access

2. **"Connection timeout"**
   - Check if your IP is whitelisted in Network Access
   - Try adding 0.0.0.0/0 for development

3. **"Invalid connection string"**
   - Make sure you copied the entire connection string
   - Check for extra spaces or characters

4. **"Cluster not found"**
   - Verify your cluster is running
   - Check the cluster identifier in the connection string

### Security Best Practices

1. **For Development**:
   - Use 0.0.0.0/0 for Network Access
   - Use simple passwords (but still secure)

2. **For Production**:
   - Whitelist specific IP addresses only
   - Use strong, complex passwords
   - Enable MongoDB Atlas security features

### Connection String Format

Your connection string should look like this:
```
mongodb+srv://username:password@cluster-name.unique-id.mongodb.net/database-name?retryWrites=true&w=majority
```

### Environment Variables

Make sure your `.env` file contains:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/bazaarbuddy?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

## Next Steps

After successful MongoDB Atlas setup:

1. **Start the server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client**:
   ```bash
   cd client
   npm run dev
   ```

3. **Test registration**:
   - Go to http://localhost:3000/register
   - Create a new account
   - Verify data is saved in MongoDB Atlas

4. **Monitor your database**:
   - Go to MongoDB Atlas dashboard
   - Click "Browse Collections" to see your data

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all steps were completed correctly
3. Check MongoDB Atlas status page
4. Review the connection string format
5. Ensure your cluster is active and running 