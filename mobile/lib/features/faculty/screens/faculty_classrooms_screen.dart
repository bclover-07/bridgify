import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class FacultyClassroomsScreen extends ConsumerStatefulWidget {
  const FacultyClassroomsScreen({super.key});

  @override
  ConsumerState<FacultyClassroomsScreen> createState() => _FacultyClassroomsScreenState();
}

class _FacultyClassroomsScreenState extends ConsumerState<FacultyClassroomsScreen> {
  bool _isLoading = true;
  List<dynamic> _classrooms = [];

  @override
  void initState() {
    super.initState();
    _fetchClassrooms();
  }

  Future<void> _fetchClassrooms() async {
    try {
      final response = await ApiClient.instance.get('/api/faculty/classrooms');
      setState(() {
        _classrooms = response.data['classrooms'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _classrooms = [];
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load classrooms: ${e.toString()}')),
        );
      }
    }
  }

  void _showAssignProjectDialog(String classroomId) {
    final TextEditingController _titleController = TextEditingController();
    final TextEditingController _descriptionController = TextEditingController();
    bool _isAssigning = false;

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
              title: const Text('Assign Group Project', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  NeuInput(
                    controller: _titleController,
                    hintText: 'Project Title',
                  ),
                  const SizedBox(height: 12),
                  NeuInput(
                    controller: _descriptionController,
                    hintText: 'Project Description',
                    maxLines: 3,
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: NeuTheme.ink, fontWeight: FontWeight.bold)),
                ),
                NeuButton(
                  text: _isAssigning ? 'Assigning...' : 'Assign',
                  backgroundColor: NeuTheme.mint,
                  onPressed: _isAssigning ? null : () async {
                    if (_titleController.text.trim().isEmpty) return;
                    setStateDialog(() => _isAssigning = true);
                    try {
                      await ApiClient.instance.post('/api/faculty/projects/assign', data: {
                        "classroomId": classroomId,
                        "title": _titleController.text.trim(),
                        "description": _descriptionController.text.trim(),
                      });
                      if (mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Project assigned successfully!')));
                      }
                    } catch (e) {
                      setStateDialog(() => _isAssigning = false);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Assign failed: ${e.toString()}')),);
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
        title: const Text('My Classrooms'),
        backgroundColor: NeuTheme.sky,
        foregroundColor: NeuTheme.ink,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: NeuTheme.sky))
          : _classrooms.isEmpty
              ? const Center(child: Text('No classrooms found.', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _classrooms.length,
                  itemBuilder: (context, index) {
                    final cls = _classrooms[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: NeuCard(
                        backgroundColor: Colors.white,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(cls['name'] ?? 'Classroom', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text('Course: ${cls['courseName'] ?? 'N/A'}', style: const TextStyle(fontSize: 14)),
                            const SizedBox(height: 4),
                            Text('Students: ${cls['studentCount'] ?? 0}', style: const TextStyle(fontSize: 14)),
                            const SizedBox(height: 16),
                            NeuButton(
                              text: 'Assign Project',
                              backgroundColor: NeuTheme.sky,
                              textColor: NeuTheme.ink,
                              onPressed: () => _showAssignProjectDialog(cls['_id']),
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
