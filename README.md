# User Management Service API

Tài liệu API cho User Management Service với xác thực JWT.

## Thông tin chung

- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **Xác thực**: JWT Token (Bearer)

## Cấu trúc response

### Response thành công
```json
{
  "status": "success",
  "message": "Thông báo kết quả",
  "data": {
    // Dữ liệu trả về
  }
}
```

### Response lỗi
```json
{
  "status": "error",
  "message": "Thông báo lỗi",
  "code": "Mã lỗi",
  "errors": [
    // Chi tiết lỗi (nếu có)
  ]
}
```

## API Endpoints

### 1. Kiểm tra trạng thái server

- **URL**: `/health`
- **Method**: `GET`
- **Xác thực**: Không

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Server is running",
  "data": {
    "timestamp": "2024-03-14T10:30:00.000Z",
    "environment": "development"
  }
}
```

### 2. Đăng ký người dùng

- **URL**: `/auth/register`
- **Method**: `POST`
- **Xác thực**: Không

#### Request body
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### Response thành công (201)
```json
{
  "status": "success",
  "message": "Đăng ký thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f2e8b7c261e6001234abcd",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

#### Response lỗi (409)
```json
{
  "status": "error",
  "message": "Email đã được sử dụng",
  "code": "EMAIL_EXISTS"
}
```

#### Response lỗi validation (422)
```json
{
  "status": "error",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "msg": "Email không hợp lệ",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Mật khẩu phải có độ dài từ 6 đến 20 ký tự",
      "param": "password",
      "location": "body"
    },
    {
      "msg": "Tên phải có độ dài từ 2 đến 50 ký tự",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### 3. Đăng nhập

- **URL**: `/auth/login`
- **Method**: `POST`
- **Xác thực**: Không

#### Request body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f2e8b7c261e6001234abcd",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Email hoặc mật khẩu không chính xác",
  "code": "INVALID_CREDENTIALS"
}
```

### 4. Đăng xuất

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Xác thực**: Có (Bearer Token)

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Đăng xuất thành công"
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Token không hợp lệ",
  "code": "INVALID_TOKEN"
}
```

### 5. Đổi mật khẩu

- **URL**: `/auth/change-password`
- **Method**: `POST`
- **Xác thực**: Có (Bearer Token)

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Request body
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Response thành công (200)
```json
{
  "status": "success",
  "message": "Đổi mật khẩu thành công"
}
```

#### Response lỗi (401)
```json
{
  "status": "error",
  "message": "Mật khẩu hiện tại không chính xác",
  "code": "INVALID_CURRENT_PASSWORD"
}
```

## Mã lỗi

| Mã lỗi | Mô tả |
|--------|-------|
| `EMAIL_EXISTS` | Email đã được sử dụng |
| `INVALID_CREDENTIALS` | Email hoặc mật khẩu không chính xác |
| `INVALID_TOKEN` | Token không hợp lệ |
| `TOKEN_EXPIRED` | Token đã hết hạn |
| `TOKEN_MISSING` | Không tìm thấy token xác thực |
| `TOKEN_BLACKLISTED` | Token đã bị vô hiệu hóa |
| `USER_NOT_FOUND` | Không tìm thấy người dùng |
| `INVALID_CURRENT_PASSWORD` | Mật khẩu hiện tại không chính xác |
| `VALIDATION_ERROR` | Dữ liệu không hợp lệ |
| `NOT_FOUND` | Route không tồn tại |
| `INTERNAL_SERVER_ERROR` | Lỗi server |

## Xử lý lỗi validation

Khi gửi dữ liệu không hợp lệ, API sẽ trả về lỗi với mã `VALIDATION_ERROR` và danh sách các lỗi cụ thể:

```json
{
  "status": "error",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "msg": "Email không hợp lệ",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Mật khẩu phải có độ dài từ 6 đến 20 ký tự",
      "param": "password",
      "location": "body"
    },
    {
      "msg": "Tên phải có độ dài từ 2 đến 50 ký tự",
      "param": "name",
      "location": "body"
    }
  ]
}
```

## Quy tắc validation

| Trường | Quy tắc |
|--------|---------|
| `email` | Phải là email hợp lệ |
| `password` | Độ dài từ 6 đến 20 ký tự |
| `name` | Độ dài từ 2 đến 50 ký tự |
| `currentPassword` | Không được để trống |
| `newPassword` | Độ dài từ 6 đến 20 ký tự |

## Hướng dẫn sử dụng

1. **Đăng ký tài khoản**:
   - Gọi API `/auth/register` với email, password và tên
   - Lưu token nhận được để sử dụng cho các API khác

2. **Đăng nhập**:
   - Gọi API `/auth/login` với email và password
   - Lưu token nhận được để sử dụng cho các API khác

3. **Sử dụng token**:
   - Thêm token vào header `Authorization: Bearer <token>` cho các API cần xác thực
   - Nếu token hết hạn hoặc không hợp lệ, gọi API đăng nhập để lấy token mới

4. **Đăng xuất**:
   - Gọi API `/auth/logout` với token hiện tại
   - Token sẽ bị vô hiệu hóa và không thể sử dụng lại

5. **Đổi mật khẩu**:
   - Gọi API `/auth/change-password` với mật khẩu hiện tại và mật khẩu mới
   - Cần xác thực bằng token

## Ví dụ sử dụng với Axios

```javascript
// Cấu hình Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Đăng ký
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('token', response.data.data.token);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Đăng nhập
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.data.token);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Đăng xuất
const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    throw error.response.data;
  }
};

// Đổi mật khẩu
const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
``` 