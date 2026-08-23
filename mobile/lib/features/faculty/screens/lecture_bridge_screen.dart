import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class LectureBridgeScreen extends ConsumerStatefulWidget {
  const LectureBridgeScreen({super.key});

  @override
  ConsumerState<LectureBridgeScreen> createState() => _LectureBridgeScreenState();
}

class _LectureBridgeScreenState extends ConsumerState<LectureBridgeScreen> {
  bool _isLoading = true;
  String _courseName = "Course";
  int _coverageRate = 0;
  List<dynamic> _taughtNotTested = [];
  List<dynamic> _testedNotTaught = [];

  @override
  void initState() {
    super.initState();
    _fetchBridgeData();
  }

  Future<void> _fetchBridgeData() async {
    try {
      final coursesRes = await ApiClient.instance.get('/api/faculty/courses');
      final courses = coursesRes.data['courses'] as List<dynamic>? ?? [];
      
      if (courses.isEmpty) {
        setState(() => _isLoading = false);
        return;
      }

      final courseId = courses[0]['_id'];

      final response = await ApiClient.instance.post('/api/faculty/lecture-bridge', data: {
        "courseId": courseId
      });
      
      setState(() {
        _courseName = response.data['courseName'] ?? "Course";
        _coverageRate = response.data['coverageRate'] ?? 0;
        _taughtNotTested = response.data['taughtNotTested'] ?? [];
        _testedNotTaught = response.data['testedNotTaught'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _taughtNotTested = []; // No mock data
        _testedNotTaught = [];
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load bridge data: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lecture Bridge Analysis'),
        backgroundColor: NeuTheme.electric,
        foregroundColor: Colors.white,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.electric))
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                NeuCard(
                  backgroundColor: NeuTheme.paper,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('$_courseName Analysis', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Syllabus Coverage', style: TextStyle(fontSize: 16)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: NeuTheme.electric,
                              border: Border.all(color: NeuTheme.ink, width: 2),
                            ),
                            child: Text('$_coverageRate%', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                          )
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Expanded(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Taught, Not Tested', style: TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.coral)),
                              const Divider(color: NeuTheme.ink, thickness: 2),
                              Expanded(
                                child: ListView.builder(
                                  itemCount: _taughtNotTested.length,
                                  itemBuilder: (context, index) {
                                    final skill = _taughtNotTested[index];
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      child: Text('• ${skill['label'] ?? skill['skillId']}', style: const TextStyle(fontSize: 14)),
                                    );
                                  },
                                ),
                              )
                            ],
                          )
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Tested, Not Taught', style: TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.amber)),
                              const Divider(color: NeuTheme.ink, thickness: 2),
                              Expanded(
                                child: ListView.builder(
                                  itemCount: _testedNotTaught.length,
                                  itemBuilder: (context, index) {
                                    final skill = _testedNotTaught[index];
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      child: Text('• ${skill['label'] ?? skill['skillId']}', style: const TextStyle(fontSize: 14)),
                                    );
                                  },
                                ),
                              )
                            ],
                          )
                        ),
                      )
                    ],
                  )
                )
              ],
            ),
          ),
    );
  }
}
