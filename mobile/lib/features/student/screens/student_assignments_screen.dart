import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class StudentAssignmentsScreen extends ConsumerStatefulWidget {
  const StudentAssignmentsScreen({super.key});

  @override
  ConsumerState<StudentAssignmentsScreen> createState() => _StudentAssignmentsScreenState();
}

class _StudentAssignmentsScreenState extends ConsumerState<StudentAssignmentsScreen> {
  bool _isLoading = true;
  List<dynamic> _assignments = [];

  @override
  void initState() {
    super.initState();
    _fetchAssignments();
  }

  Future<void> _fetchAssignments() async {
    try {
      final response = await ApiClient.instance.get('/api/student/assignments');
      setState(() {
        _assignments = response.data['assignments'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _assignments = [];
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load assignments: ${e.toString()}')),
        );
      }
    }
  }

  void _showSubmitDialog(Map<String, dynamic> assignment) {
    final TextEditingController _codeController = TextEditingController();
    bool _isSubmitting = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: NeuTheme.paper,
              shape: RoundedRectangleBorder(
                side: const BorderSide(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                borderRadius: BorderRadius.circular(NeuTheme.radiusCard),
              ),
              title: Text('Submit ${assignment['title'] ?? 'Assignment'}', style: const TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  NeuInput(
                    controller: _codeController,
                    hintText: 'Paste code or answer here...',
                    maxLines: 5,
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: NeuTheme.ink, fontWeight: FontWeight.bold)),
                ),
                NeuButton(
                  text: _isSubmitting ? 'Submitting...' : 'Submit',
                  backgroundColor: NeuTheme.mint,
                  onPressed: _isSubmitting ? null : () async {
                    if (_codeController.text.trim().isEmpty) return;
                    setStateDialog(() => _isSubmitting = true);
                    try {
                      await ApiClient.instance.post('/api/student/assignments/submit', data: {
                        "assignmentId": assignment['_id'],
                        "code": _codeController.text.trim(),
                        "language": "javascript",
                      });
                      if (mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Assignment submitted successfully!')));
                        _fetchAssignments();
                      }
                    } catch (e) {
                      setStateDialog(() => _isSubmitting = false);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Submit failed: ${e.toString()}')));
                      }
                    }
                  },
                ),
              ],
            );
          }
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Assignments'),
        backgroundColor: NeuTheme.amber,
        foregroundColor: NeuTheme.ink,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: NeuTheme.amber))
          : _assignments.isEmpty
              ? const Center(child: Text('No pending assignments.', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _assignments.length,
                  itemBuilder: (context, index) {
                    final assignment = _assignments[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: NeuCard(
                        backgroundColor: Colors.white,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(assignment['title'] ?? 'Untitled Assignment', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text(assignment['description'] ?? 'No description provided.', style: const TextStyle(fontSize: 14)),
                            const SizedBox(height: 16),
                            NeuButton(
                              text: 'Submit Work',
                              backgroundColor: NeuTheme.amber,
                              textColor: NeuTheme.ink,
                              onPressed: () => _showSubmitDialog(assignment),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
