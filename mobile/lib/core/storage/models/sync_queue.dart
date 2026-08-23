import 'package:isar/isar.dart';

part 'sync_queue.g.dart';

@collection
class SyncQueue {
  Id id = Isar.autoIncrement;

  @Index()
  late String method;

  late String path;
  
  late String payload; // JSON encoded map
  
  @Index()
  late DateTime createdAt;
  
  @Index()
  bool isSyncing = false;
  
  int retryCount = 0;
}
