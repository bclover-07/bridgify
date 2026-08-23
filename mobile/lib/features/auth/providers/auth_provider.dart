import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import 'package:dio/dio.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

class AuthState {
  final bool isLoading;
  final String? token;
  final Map<String, dynamic>? user;
  final String? error;

  AuthState({
    this.isLoading = false,
    this.token,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isLoading,
    String? token,
    Map<String, dynamic>? user,
    String? error,
    bool clearError = false,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      token: token ?? this.token,
      user: user ?? this.user,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState());

  Future<bool> login(String email, String password, String role) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await ApiClient.instance.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });

      final token = response.data['token'];
      final user = response.data['user'];

      // Save token securely
      await ApiClient.storage.write(key: 'jwt', value: token);
      await ApiClient.storage.write(key: 'user_role', value: user['role']);
      await ApiClient.storage.write(key: 'user_data', value: user.toString());

      state = state.copyWith(isLoading: false, token: token, user: user);
      return true;
    } on DioException catch (e) {
      String errorMessage = 'Login failed';
      if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
        errorMessage = 'Connection timed out. Server unreachable.';
      } else if (e.type == DioExceptionType.connectionError) {
        errorMessage = 'Network connection failed (Connection Refused).';
      } else if (e.response != null && e.response?.data != null) {
        errorMessage = e.response?.data['error'] ?? e.response?.data['message'] ?? errorMessage;
      } else {
        errorMessage = e.message ?? errorMessage;
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Unexpected error: ${e.toString()}');
      return false;
    }
  }

  Future<bool> registerUser({
    required String name,
    required String email,
    required String password,
    required String role,
    String? institutionCode,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await ApiClient.instance.post('/api/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        if (institutionCode != null && institutionCode.isNotEmpty) 'institutionCode': institutionCode,
      });

      final token = response.data['accessToken'] ?? response.data['token']; // Fallback in case it's named 'token'
      final user = response.data['user'];

      // Save token securely
      if (token != null) {
         await ApiClient.storage.write(key: 'jwt', value: token);
      }
      if (user != null) {
         await ApiClient.storage.write(key: 'user_role', value: user['role']);
         await ApiClient.storage.write(key: 'user_data', value: user.toString());
      }

      state = state.copyWith(isLoading: false, token: token, user: user);
      return true;
    } on DioException catch (e) {
      String errorMessage = 'Registration failed';
      if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
        errorMessage = 'Connection timed out. Server unreachable.';
      } else if (e.type == DioExceptionType.connectionError) {
        errorMessage = 'Network connection failed (Connection Refused).';
      } else if (e.response != null && e.response?.data != null) {
        errorMessage = e.response?.data['error'] ?? e.response?.data['message'] ?? errorMessage;
      } else {
        errorMessage = e.message ?? errorMessage;
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Unexpected error: ${e.toString()}');
      return false;
    }
  }

  Future<void> logout() async {
    await ApiClient.storage.deleteAll();
    state = AuthState();
  }
}
