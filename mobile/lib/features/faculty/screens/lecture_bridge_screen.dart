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
  String _courseId = "";
  int _coverageRate = 0;
  List<dynamic> _taughtNotTested = [];
  List<dynamic> _testedNotTaught = [];

  // OCR Assign State
  final TextEditingController _noteTitleController = TextEditingController();
  final TextEditingController _noteContentController = TextEditingController();
  bool _isPublishing = false;
  Map<String, dynamic>? _publishResult;

  @override
  void initState() {
    super.initState();
    _fetchBridgeData();
  }

  Future<void> _handleOcrAutoAssign() async {
    if (_noteContentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter lecture notes content!')));
      return;
    }
    setState(() => _isPublishing = true);

    try {
      final res = await ApiClient.instance.post('/api/faculty/lecture-bridge/auto-assign', data: {
        "courseId": _courseId,
        "title": _noteTitleController.text.trim().isEmpty ? 'Lecture Practice Assignment' : _noteTitleController.text.trim(),
        "noteContent": _noteContentController.text.trim(),
        "mimeType": "text/plain",
      });

      setState(() {
        _publishResult = res.data;
        _isPublishing = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Assignment generated & published!')));
      }
    } catch (e) {
      setState(() => _isPublishing = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: ${e.toString()}')));
      }
    }
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
      _courseId = courseId;

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
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  NeuCard(
                    backgroundColor: NeuTheme.paper,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text('OCR Notes to Practice Quiz', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        NeuInput(
                          controller: _noteTitleController,
                          hintText: 'Assignment Title',
                        ),
                        const SizedBox(height: 16),
                        NeuInput(
                          controller: _noteContentController,
                          hintText: 'Paste lecture text or OCR data here...',
                          maxLines: 4,
                        ),
                        const SizedBox(height: 16),
                        NeuButton(
                          text: _isPublishing ? 'Auto-Publishing to Class...' : 'Auto-Assign from Notes',
                          backgroundColor: NeuTheme.mint,
                          onPressed: _isPublishing ? null : _handleOcrAutoAssign,
                        ),
                        if (_publishResult != null) ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Row(
                                  children: [
                                    Icon(Icons.check_circle, color: NeuTheme.ink),
                                    SizedBox(width: 8),
                                    Text('Published Successfully!', style: TextStyle(fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(_publishResult!['message'] ?? '', style: const TextStyle(fontSize: 14)),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: (_publishResult!['extractedTopics'] as List<dynamic>? ?? []).map<Widget>((t) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: NeuTheme.electric,
                                      border: Border.all(color: NeuTheme.ink),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text('📌 $t', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                                  )).toList(),
                                ),
                              ],
                            ),
                          ),
                        ]
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
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
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Taught, Not Tested', style: TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.coral)),
                              const Divider(color: NeuTheme.ink, thickness: 2),
                              ..._taughtNotTested.map((skill) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Text('• ${skill['label'] ?? skill['skillId']}', style: const TextStyle(fontSize: 14)),
                              )),
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
                              ..._testedNotTaught.map((skill) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Text('• ${skill['label'] ?? skill['skillId']}', style: const TextStyle(fontSize: 14)),
                              )),
                            ],
                          )
                        ),
                      )
                    ],
                  )
                ],
              ),
            ),
          ),
    );
  }
}
