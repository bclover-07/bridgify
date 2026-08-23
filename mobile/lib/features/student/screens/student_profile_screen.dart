import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

class StudentProfileScreen extends ConsumerStatefulWidget {
  const StudentProfileScreen({super.key});

  @override
  ConsumerState<StudentProfileScreen> createState() => _StudentProfileScreenState();
}

class _StudentProfileScreenState extends ConsumerState<StudentProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _profile;
  List<dynamic> _courses = [];
  List<dynamic> _grades = [];

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final response = await ApiClient.instance.get('/api/student/profile/academics');
      setState(() {
        _profile = response.data['profile'];
        _courses = response.data['enrolledCourses'] ?? [];
        _grades = response.data['recentGrades'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _profile = null;
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load profile: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user ?? {};

    return Scaffold(
      appBar: AppBar(
        title: const Text('Academic Profile'),
        backgroundColor: NeuTheme.sky,
        foregroundColor: NeuTheme.ink,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: NeuTheme.sky))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: PageTransition(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    StaggerItem(
                      index: 0,
                      child: NeuCard(
                        backgroundColor: NeuTheme.paper,
                        child: Row(
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: NeuTheme.sky,
                                border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.person, size: 40, color: NeuTheme.ink),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(user['name'] ?? 'Student', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Text(user['email'] ?? 'No Email', style: const TextStyle(fontSize: 14)),
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    if (_profile != null) ...[
                      StaggerItem(
                        index: 1,
                        child: NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Academic Record', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NeuTheme.sky)),
                              const Divider(color: NeuTheme.ink, thickness: 2),
                              const SizedBox(height: 8),
                              _buildProfileRow('Institution', _profile!['institution'] ?? 'N/A'),
                              _buildProfileRow('Branch', _profile!['branch'] ?? 'N/A'),
                              _buildProfileRow('Year', _profile!['year']?.toString() ?? 'N/A'),
                              _buildProfileRow('Semester', _profile!['semester']?.toString() ?? 'N/A'),
                              _buildProfileRow('CGPA', _profile!['cgpa']?.toString() ?? 'N/A'),
                              _buildProfileRow('Attendance', '${_profile!['attendancePercentage']?.toString() ?? 'N/A'}%'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      if (_courses.isNotEmpty)
                        StaggerItem(
                          index: 2,
                          child: NeuCard(
                            backgroundColor: Colors.white,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Enrolled Courses', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NeuTheme.electric)),
                                const Divider(color: NeuTheme.ink, thickness: 2),
                                const SizedBox(height: 8),
                                ..._courses.map((c) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('${c['code']} - ${c['title']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      Text('Faculty: ${c['faculty']}'),
                                      Text('Progress: ${c['lessonsCompleted']} / ${c['totalLessons']} lessons'),
                                    ],
                                  ),
                                )),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 24),
                      if (_grades.isNotEmpty)
                        StaggerItem(
                          index: 3,
                          child: NeuCard(
                            backgroundColor: Colors.white,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Recent Grades', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NeuTheme.amber)),
                                const Divider(color: NeuTheme.ink, thickness: 2),
                                const SizedBox(height: 8),
                                ..._grades.map((g) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(child: Text(g['assessmentTitle'] ?? 'Assessment', style: const TextStyle(fontWeight: FontWeight.bold))),
                                      Text('${g['score']} / ${g['totalMarks']}', style: const TextStyle(fontWeight: FontWeight.w900, color: NeuTheme.ink, fontSize: 16)),
                                    ],
                                  ),
                                )),
                              ],
                            ),
                          ),
                        ),
                    ] else 
                      const Center(child: Text("No academic profile found."))
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildProfileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          Text(value, style: const TextStyle(fontSize: 16)),
        ],
      ),
    );
  }
}
