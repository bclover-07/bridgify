import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class StudentLeaderboardScreen extends ConsumerStatefulWidget {
  const StudentLeaderboardScreen({super.key});

  @override
  ConsumerState<StudentLeaderboardScreen> createState() => _StudentLeaderboardScreenState();
}

class _StudentLeaderboardScreenState extends ConsumerState<StudentLeaderboardScreen> {
  bool _isLoading = true;
  List<dynamic> _leaderboard = [];

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  Future<void> _fetchLeaderboard() async {
    try {
      final response = await ApiClient.instance.get('/api/student/leaderboard');
      setState(() {
        _leaderboard = response.data['leaderboard'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _leaderboard = [];
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load leaderboard: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Global Leaderboard'),
        backgroundColor: NeuTheme.coral,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: NeuTheme.coral))
          : _leaderboard.isEmpty
              ? const Center(child: Text('No leaderboard data yet.', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)))
              : PageTransition(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _leaderboard.length,
                    itemBuilder: (context, index) {
                      final student = _leaderboard[index];
                      final rank = index + 1;
                      Color rankColor = NeuTheme.paper;
                      if (rank == 1) rankColor = NeuTheme.amber;
                      if (rank == 2) rankColor = Colors.grey.shade300;
                      if (rank == 3) rankColor = Colors.orange.shade200;

                      return StaggerItem(
                        index: index,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: NeuCard(
                            backgroundColor: rankColor,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: Row(
                              children: [
                                Text('#$rank', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(student['name'] ?? 'Unknown', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      if (student['badge'] != null)
                                        Text('Badge: ${student['badge']}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: NeuTheme.electric,
                                    border: Border.all(color: NeuTheme.ink, width: 2),
                                    borderRadius: BorderRadius.circular(NeuTheme.radiusButton)
                                  ),
                                  child: Text('${student['readinessScore'] ?? 0} pts', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                )
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
