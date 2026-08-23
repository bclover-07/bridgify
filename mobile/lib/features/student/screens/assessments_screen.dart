import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class AssessmentsScreen extends ConsumerStatefulWidget {
  const AssessmentsScreen({super.key});

  @override
  ConsumerState<AssessmentsScreen> createState() => _AssessmentsScreenState();
}

class _AssessmentsScreenState extends ConsumerState<AssessmentsScreen> {
  bool isLoading = true;
  List<dynamic> assessments = [];

  @override
  void initState() {
    super.initState();
    _fetchAssessments();
  }

  Future<void> _fetchAssessments() async {
    try {
      final response = await ApiClient.instance.get('/api/student/assessments');
      setState(() {
        assessments = response.data['assessments'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        assessments = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load assessments: ${e.toString()}')));
      }
    }
  }

  void _takeAssessment(Map<String, dynamic> assessment) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => TakeAssessmentScreen(assessment: assessment),
      ),
    ).then((_) => _fetchAssessments()); // Refresh on back
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Assessments'),
        backgroundColor: NeuTheme.mint,
        foregroundColor: NeuTheme.ink,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.mint))
        : assessments.isEmpty 
          ? const Center(child: Text("No upcoming assessments found."))
          : PageTransition(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: assessments.length,
                itemBuilder: (context, index) {
                  final item = assessments[index];
                  final hasSubmitted = item['hasSubmitted'] == true;
                  final score = hasSubmitted && item['submission'] != null ? item['submission']['percentage'] ?? item['submission']['totalScore'] ?? 0 : 0;
                  final questionsCount = (item['questions'] as List<dynamic>? ?? []).length;
                  
                  return StaggerItem(
                    index: index,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: NeuCard(
                        backgroundColor: !hasSubmitted ? NeuTheme.paper : NeuTheme.acid,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(item['title'] ?? 'Untitled Assessment', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text(
                              !hasSubmitted ? 'Pending - $questionsCount Questions' : 'Completed - Score: $score%',
                              style: TextStyle(color: Colors.grey[800]),
                            ),
                            const SizedBox(height: 16),
                            if (!hasSubmitted)
                              NeuButton(
                                text: 'Start Assessment',
                                backgroundColor: NeuTheme.mint,
                                onPressed: () => _takeAssessment(item),
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

class TakeAssessmentScreen extends StatefulWidget {
  final Map<String, dynamic> assessment;
  const TakeAssessmentScreen({super.key, required this.assessment});

  @override
  State<TakeAssessmentScreen> createState() => _TakeAssessmentScreenState();
}

class _TakeAssessmentScreenState extends State<TakeAssessmentScreen> {
  bool _isLoading = true;
  List<dynamic> _questions = [];
  int _currentQ = 0;
  String? _selectedAns;
  bool _submitted = false;
  Map<String, String> _answers = {}; // questionId -> response

  @override
  void initState() {
    super.initState();
    _fetchDetails();
  }

  Future<void> _fetchDetails() async {
    try {
      final response = await ApiClient.instance.get('/api/student/assessments/${widget.assessment['_id']}');
      final data = response.data['assessment'];
      setState(() {
        _questions = data['questions'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load questions: ${e.toString()}')));
        Navigator.pop(context);
      }
    }
  }

  Future<void> _submitQuiz() async {
    if (_selectedAns != null && _questions.isNotEmpty) {
      _answers[_questions[_currentQ]['_id']] = _selectedAns!;
    }
    
    setState(() {
      _isLoading = true;
    });

    final payload = _answers.entries.map((e) => {
      "questionId": e.key,
      "response": e.value
    }).toList();

    try {
      await ApiClient.instance.post('/api/student/assessments/${widget.assessment['_id']}/submit', data: {"answers": payload});
      setState(() {
        _submitted = true;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Submission failed: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(backgroundColor: NeuTheme.mint, title: Text(widget.assessment['title'] ?? 'Assessment')),
        body: const Center(child: CircularProgressIndicator(color: NeuTheme.mint)),
      );
    }

    if (_submitted) {
      return Scaffold(
        appBar: AppBar(backgroundColor: NeuTheme.mint),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.stars, size: 80, color: NeuTheme.amber),
              const SizedBox(height: 16),
              const Text('Assessment Submitted!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('AI is evaluating your answers...'),
              const SizedBox(height: 24),
              NeuButton(
                text: 'Go Back',
                backgroundColor: NeuTheme.mint,
                onPressed: () => Navigator.of(context).pop(),
              )
            ],
          ),
        ),
      );
    }

    if (_questions.isEmpty) {
      return Scaffold(
        appBar: AppBar(backgroundColor: NeuTheme.mint, title: Text(widget.assessment['title'] ?? 'Assessment')),
        body: const Center(child: Text("No questions in this assessment.")),
      );
    }

    final q = _questions[_currentQ];
    final options = (q['options'] as List<dynamic>? ?? []);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.assessment['title'] ?? 'Assessment'),
        backgroundColor: NeuTheme.mint,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: PageTransition(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              StaggerItem(
                index: 0,
                child: Text('Question ${_currentQ + 1} of ${_questions.length}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              const SizedBox(height: 16),
              StaggerItem(
                index: 1,
                child: NeuCard(
                  backgroundColor: NeuTheme.paper,
                  child: Text(q['questionText'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 24),
              ...options.asMap().entries.map((entry) {
                final int idx = entry.key;
                final opt = entry.value;
                final text = opt['text'] as String;
                return StaggerItem(
                  index: idx + 2,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedAns = text),
                      child: NeuCard(
                        backgroundColor: _selectedAns == text ? NeuTheme.acid : Colors.white,
                        child: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                );
              }).toList(),
              const Spacer(),
              StaggerItem(
                index: options.length + 2,
                child: NeuButton(
                  text: _currentQ == _questions.length - 1 ? 'Submit Assessment' : 'Next Question',
                  backgroundColor: NeuTheme.mint,
                  onPressed: () {
                    if (_selectedAns == null) return;
                    
                    _answers[q['_id']] = _selectedAns!;

                    if (_currentQ == _questions.length - 1) {
                      _submitQuiz();
                    } else {
                      setState(() {
                        _currentQ++;
                        _selectedAns = _answers[_questions[_currentQ]['_id']]; 
                      });
                    }
                  },
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
