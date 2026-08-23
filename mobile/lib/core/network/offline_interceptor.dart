import 'package:dio/dio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../storage/local_db.dart';
import '../storage/models/sync_queue.dart';
import 'dart:convert';

class OfflineInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final connectivityResult = await (Connectivity().checkConnectivity());
    
    // If offline and request is a modifying request (POST, PUT, PATCH, DELETE)
    if (connectivityResult.contains(ConnectivityResult.none) && connectivityResult.length == 1) {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].contains(options.method.toUpperCase())) {
        // Save to Isar offline queue
        final queueItem = SyncQueue()
          ..method = options.method
          ..path = options.path
          ..payload = jsonEncode(options.data ?? {})
          ..createdAt = DateTime.now();

        await LocalDB.isar.writeTxn(() async {
          await LocalDB.isar.syncQueues.put(queueItem);
        });

        // Return a mock success response so the UI can proceed optimistically
        return handler.resolve(Response(
          requestOptions: options,
          statusCode: 200,
          data: {'status': 'queued', 'message': 'Saved offline'},
        ));
      } else {
        // For GET requests, we could return cached data here, but for now we'll reject
        // and let Riverpod handle the fallback from Isar cache
        return handler.reject(DioException(
          requestOptions: options,
          error: 'No internet connection',
          type: DioExceptionType.connectionError,
        ));
      }
    }

    return super.onRequest(options, handler);
  }
}
