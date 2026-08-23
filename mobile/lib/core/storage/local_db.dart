import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'models/sync_queue.dart';

class LocalDB {
  static late Isar isar;

  static Future<void> init() async {
    final dir = await getApplicationDocumentsDirectory();
    isar = await Isar.open(
      [SyncQueueSchema],
      directory: dir.path,
    );
  }
}
