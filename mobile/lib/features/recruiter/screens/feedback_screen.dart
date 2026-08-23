import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class FeedbackScreen extends ConsumerStatefulWidget {
  const FeedbackScreen({super.key});

  @override
  ConsumerState<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends ConsumerState<FeedbackScreen> {
  final TextEditingController _candidateIdController = TextEditingController();
  final TextEditingController _feedbackController = TextEditingController();
  double _techRating = 3.0;
  double _commRating = 3.0;
  double _fitRating = 3.0;
  bool _isSubmitting = false;

  bool _isLoadingDrives = true;
  List<dynamic> _drives = [];
  String? _selectedDriveId;

  @override
  void initState() {
    super.initState();
    _fetchDrives();
  }

  Future<void> _fetchDrives() async {
    try {
      final response = await ApiClient.instance.get('/api/recruiter/dashboard');
      setState(() {
        _drives = response.data['recentDrives'] ?? [];
        if (_drives.isNotEmpty) {
          _selectedDriveId = _drives[0]['_id'];
        }
        _isLoadingDrives = false;
      });
    } catch (e) {
      setState(() {
        _drives = [];
        _isLoadingDrives = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load drives: ${e.toString()}')));
      }
    }
  }

  Future<void> _submitFeedback() async {
    if (_candidateIdController.text.trim().isEmpty || _feedbackController.text.trim().isEmpty || _selectedDriveId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select drive, student ID, and feedback')));
      return;
    }
    
    setState(() => _isSubmitting = true);
    try {
      await ApiClient.instance.post('/api/recruiter/drives/$_selectedDriveId/feedback', data: {
        "studentId": _candidateIdController.text.trim(),
        "feedback": _feedbackController.text.trim(),
        // Translating UI ratings to abstract skill signals (optional but good for SEG)
        "skillSignals": [
          {"skillId": "tech", "score": _techRating * 20, "feedback": "Technical rating"},
          {"skillId": "comm", "score": _commRating * 20, "feedback": "Communication rating"}
        ]
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Feedback Submitted!')));
        _candidateIdController.clear();
        _feedbackController.clear();
        setState(() {
          _techRating = 3.0;
          _commRating = 3.0;
          _fitRating = 3.0;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to submit: ${e.toString()}')));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Interview Feedback'),
        backgroundColor: NeuTheme.coral,
        foregroundColor: Colors.white,
      ),
      body: _isLoadingDrives 
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.coral))
        : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_drives.isNotEmpty)
              NeuCard(
                backgroundColor: NeuTheme.paper,
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedDriveId,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: NeuTheme.ink),
                    items: _drives.map((d) {
                      return DropdownMenuItem(
                        value: d['_id'] as String,
                        child: Text('${d['company']} Drive', style: const TextStyle(fontWeight: FontWeight.bold)),
                      );
                    }).toList(),
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _selectedDriveId = v);
                      }
                    },
                  ),
                ),
              ),
            if (_drives.isEmpty)
              const Center(child: Text("No active drives to submit feedback for.")),
            const SizedBox(height: 24),
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Candidate Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _candidateIdController,
                    hintText: 'Student Object ID',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            NeuCard(
              backgroundColor: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Evaluation Ratings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _buildSlider('Technical Skills', _techRating, (v) => setState(() => _techRating = v)),
                  const SizedBox(height: 16),
                  _buildSlider('Communication', _commRating, (v) => setState(() => _commRating = v)),
                  const SizedBox(height: 16),
                  _buildSlider('Culture Fit', _fitRating, (v) => setState(() => _fitRating = v)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Detailed Comments', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _feedbackController,
                    hintText: 'Provide detailed feedback...',
                    maxLines: 5,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            NeuButton(
              text: _isSubmitting ? 'Submitting...' : 'Submit Feedback',
              backgroundColor: NeuTheme.coral,
              textColor: Colors.white,
              onPressed: _isSubmitting || _drives.isEmpty ? null : _submitFeedback,
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(String label, double value, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(value.toInt().toString(), style: const TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.coral, fontSize: 18)),
          ],
        ),
        SliderTheme(
          data: SliderThemeData(
            activeTrackColor: NeuTheme.coral,
            inactiveTrackColor: NeuTheme.coral.withOpacity(0.3),
            thumbColor: NeuTheme.ink,
            trackHeight: 8,
          ),
          child: Slider(
            value: value,
            min: 1,
            max: 5,
            divisions: 4,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}
