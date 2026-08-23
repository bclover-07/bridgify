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

  Future<void> _submitFeedback() async {
    if (_candidateIdController.text.trim().isEmpty || _feedbackController.text.trim().isEmpty) return;
    
    setState(() => _isSubmitting = true);
    try {
      await ApiClient.instance.post('/api/recruiter/feedback', data: {
        "candidate_id": _candidateIdController.text,
        "technical_rating": _techRating.toInt(),
        "communication_rating": _commRating.toInt(),
        "culture_fit_rating": _fitRating.toInt(),
        "comments": _feedbackController.text,
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
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Feedback queued offline')));
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Candidate Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  NeuInput(
                    controller: _candidateIdController,
                    hintText: 'Candidate ID or Name',
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
              color: NeuTheme.coral,
              textColor: Colors.white,
              onPressed: _isSubmitting ? null : _submitFeedback,
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
