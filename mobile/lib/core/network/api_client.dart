import 'package:dio/dio.dart';
import 'offline_interceptor.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:flutter/foundation.dart';

class ApiClient {
  static late Dio _dio;
  static const storage = FlutterSecureStorage();

  static Future<void> init({String? baseUrl}) async {
    // Network Auto-Discovery: Test all possible connections
    String defaultUrl = 'http://localhost:5000';
    if (!kIsWeb) {
      List<String> candidateUrls = [
         'http://localhost:5000',      // Physical device via adb reverse
         'http://10.0.2.2:5000',       // Android emulator
         'http://192.168.137.1:5000',  // Mobile Hotspot
         'http://10.20.135.188:5000',  // Wi-Fi Local IP
         'https://kind-glasses-draw.loca.lt' // Localtunnel fallback
      ];
      final dioPing = Dio(BaseOptions(
         connectTimeout: const Duration(milliseconds: 1500),
         validateStatus: (status) => true,
         headers: {'Bypass-Tunnel-Reminder': 'true'},
      ));
      for (String url in candidateUrls) {
        try {
           await dioPing.get(url);
           defaultUrl = url;
           debugPrint('Auto-Discovery connected to: \$url');
           break;
        } catch (e) {
           debugPrint('Auto-Discovery failed on: \$url');
        }
      }
    }

    _dio = Dio(BaseOptions(
      baseUrl: baseUrl ?? defaultUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true', // For localtunnel
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
