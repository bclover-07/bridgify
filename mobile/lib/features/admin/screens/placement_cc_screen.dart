import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class PlacementCCScreen extends ConsumerStatefulWidget {
  const PlacementCCScreen({super.key});

  @override
  ConsumerState<PlacementCCScreen> createState() => _PlacementCCScreenState();
}

class _PlacementCCScreenState extends ConsumerState<PlacementCCScreen> {
  bool isLoading = true;
  Map<String, List<dynamic>> board = {
    'Sourcing': [],
    'Interview': [],
    'Placed': [],
  };

  @override
  void initState() {
    super.initState();
    _fetchBoard();
  }

  Future<void> _fetchBoard() async {
    try {
      final response = await ApiClient.instance.get('/api/admin/placement-cc');
      // The backend returns { drives, pipeline, totalDrives }
      // The pipeline might be a flat list of registrations or aggregated
      // We will assume 'pipeline' is a list of candidate objects for now.
      final candidates = response.data['pipeline'] as List<dynamic>? ?? [];
      _processBoard(candidates);
    } catch (e) {
      _processBoard([]); // No mock data
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load placement data: ${e.toString()}')),
        );
      }
    }
  }

  void _processBoard(List<dynamic> candidates) {
    setState(() {
      board = {
        'Sourcing': candidates.where((c) => c['stage'] == 'Sourced' || c['status'] == 'Sourcing').toList(),
        'Interview': candidates.where((c) => c['stage'] == 'Interviewed' || c['status'] == 'Interview').toList(),
        'Placed': candidates.where((c) => c['stage'] == 'Placed' || c['status'] == 'Placed').toList(),
      };
      isLoading = false;
    });
  }

  Future<void> _updateCandidateStatus(dynamic candidate, String newStatus) async {
    final oldStatus = candidate['status'] ?? candidate['stage'] ?? 'Sourcing';
    setState(() {
      board[oldStatus]?.remove(candidate);
      candidate['status'] = newStatus;
      candidate['stage'] = newStatus;
      board[newStatus]?.add(candidate);
    });
    try {
      await ApiClient.instance.patch('/api/admin/placement-cc/move-stage', data: {
        "studentId": candidate['studentId'] ?? candidate['id'] ?? candidate['_id'],
        "driveId": candidate['driveId'],
        "newStage": newStatus,
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update stage: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Placement Command Center'),
        backgroundColor: NeuTheme.hotpink,
        foregroundColor: Colors.white,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.hotpink))
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildColumn('Sourcing', NeuTheme.sky),
                const SizedBox(width: 16),
                _buildColumn('Interview', NeuTheme.amber),
                const SizedBox(width: 16),
                _buildColumn('Placed', NeuTheme.mint),
              ],
            ),
          ),
    );
  }

  Widget _buildColumn(String title, Color color) {
    final list = board[title] ?? [];
    return Expanded(
      child: NeuCard(
        backgroundColor: NeuTheme.paper,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              decoration: BoxDecoration(
                color: color,
                border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '$title (${list.length})',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: DragTarget<Object>(
                onAccept: (data) => _updateCandidateStatus(data, title),
                builder: (context, List<Object?> candidateData, List<dynamic> rejectedData) {
                  return ListView.builder(
                    itemCount: list.length,
                    itemBuilder: (context, index) {
                      final item = list[index];
                      return LongPressDraggable<Object>(
                        data: item,
                        feedback: Material(
                          color: Colors.transparent,
                          child: SizedBox(
                            width: 200,
                            child: _buildCandidateCard(item),
                          ),
                        ),
                        childWhenDragging: Opacity(
                          opacity: 0.5,
                          child: _buildCandidateCard(item),
                        ),
                        child: _buildCandidateCard(item),
                      );
                    },
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCandidateCard(dynamic item) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: NeuCard(
        backgroundColor: Colors.white,
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 4),
            Text(item['company'], style: TextStyle(color: Colors.grey[700], fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
