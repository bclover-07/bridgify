import 'package:dio/dio.dart';
import 'offline_interceptor.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:flutter/foundation.dart';

class ApiClient {
  static late Dio _dio;
  static const storage = FlutterSecureStorage();

  static void init({String? baseUrl}) {
    // Use localhost since adb reverse tcp:5000 tcp:5000 maps physical devices to host
    // If using an emulator, you may need to change this to http://10.0.2.2:5000
    String defaultUrl = 'http://localhost:5000';
    if (!kIsWeb) {
      // Force localhost for the physical device RMX5110 via adb reverse
      defaultUrl = 'http://localhost:5000';
    }
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl ?? defaultUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: 'jwt');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));

    _dio.interceptors.add(LogInterceptor(
      request: true,
      requestBody: true,
      responseBody: true,
      error: true,
      logPrint: (obj) => debugPrint(obj.toString()),
    ));

    _dio.interceptors.add(OfflineInterceptor());
  }

  static Dio get instance => _dio;
}
