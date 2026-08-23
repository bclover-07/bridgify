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
        assessments = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        assessments = [
          {"id": 1, "title": "React Fundamentals", "status": "pending", "questions": 10},
          {"id": 2, "title": "System Design Basics", "status": "completed", "score": 85},
        ];
        isLoading = false;
      });
    }
  }

  void _takeAssessment(Map<String, dynamic> assessment) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => TakeAssessmentScreen(assessment: assessment),
      ),
    );
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
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: assessments.length,
            itemBuilder: (context, index) {
              final item = assessments[index];
              final isPending = item['status'] == 'pending';
              
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: NeuCard(
                  backgroundColor: isPending ? NeuTheme.paper : NeuTheme.acid,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(item['title'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(
                        isPending ? 'Pending - ${item['questions']} Questions' : 'Completed - Score: ${item['score']}%',
                        style: TextStyle(color: Colors.grey[800]),
                      ),
                      const SizedBox(height: 16),
                      if (isPending)
                        NeuButton(
                          text: 'Start Assessment',
                          color: NeuTheme.mint,
                          onPressed: () => _takeAssessment(item),
                        )
                    ],
                  ),
                ),
              );
            },
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
  int _currentQ = 0;
  String? _selectedAns;
  bool _submitted = false;

  final List<Map<String, dynamic>> _mockQuestions = [
    {
      "q": "What is the primary purpose of React?",
      "options": ["Database management", "Building user interfaces", "Server-side rendering", "Machine learning"],
      "ans": "Building user interfaces"
    },
    {
      "q": "Which hook is used to manage state in functional components?",
      "options": ["useEffect", "useContext", "useState", "useReducer"],
      "ans": "useState"
    }
  ];

  Future<void> _submitQuiz() async {
    setState(() => _submitted = true);
    try {
      await ApiClient.instance.post('/api/student/assessments/${widget.assessment['id']}/submit', data: {"score": 100});
    } catch (e) {
      // offline interceptor handles it
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Scaffold(
        appBar: AppBar(backgroundColor: NeuTheme.mint),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.stars, size: 80, color: NeuTheme.amber),
              const SizedBox(height: 16),
              const Text('Assessment Completed!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              NeuButton(
                text: 'Go Back',
                color: NeuTheme.mint,
                onPressed: () => Navigator.of(context).pop(),
              )
            ],
          ),
        ),
      );
    }

    final q = _mockQuestions[_currentQ];

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.assessment['title']),
        backgroundColor: NeuTheme.mint,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Question ${_currentQ + 1} of ${_mockQuestions.length}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Text(q['q'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 24),
            ...q['options'].map((opt) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GestureDetector(
                onTap: () => setState(() => _selectedAns = opt),
                child: NeuCard(
                  backgroundColor: _selectedAns == opt ? NeuTheme.acid : Colors.white,
                  child: Text(opt, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            )).toList(),
            const Spacer(),
            NeuButton(
              text: _currentQ == _mockQuestions.length - 1 ? 'Submit' : 'Next',
              color: NeuTheme.mint,
              onPressed: () {
                if (_selectedAns == null) return;
                if (_currentQ == _mockQuestions.length - 1) {
                  _submitQuiz();
                } else {
                  setState(() {
                    _currentQ++;
                    _selectedAns = null;
                  });
                }
              },
            )
          ],
        ),
      ),
    );
  }
}
