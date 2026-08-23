import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class MentorshipScreen extends ConsumerStatefulWidget {
  const MentorshipScreen({super.key});

  @override
  ConsumerState<MentorshipScreen> createState() => _MentorshipScreenState();
}

class _MentorshipScreenState extends ConsumerState<MentorshipScreen> {
  bool isLoading = true;
  List<dynamic> pairs = [];

  @override
  void initState() {
    super.initState();
    _fetchMatches();
  }

  Future<void> _fetchMatches() async {
    try {
      final coursesRes = await ApiClient.instance.get('/api/faculty/courses');
      final courses = coursesRes.data['courses'] as List<dynamic>? ?? [];
      
      if (courses.isEmpty) {
        setState(() => isLoading = false);
        return;
      }

      final courseId = courses[0]['_id'];

      final response = await ApiClient.instance.post('/api/faculty/mentorship/match', data: {
        "courseId": courseId
      });
      setState(() {
        pairs = response.data['pairs'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        pairs = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load mentorship pairs: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Peer Mentorship Matches'),
        backgroundColor: NeuTheme.acid,
        foregroundColor: NeuTheme.ink,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.acid))
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
                      const Text('Peer-to-Peer Mentoring', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      const Text('Matches top students (Mentors) with struggling students (Mentees) in the current cohort.'),
                      const SizedBox(height: 16),
                      NeuButton(
                        text: 'Refresh Matches',
                        backgroundColor: NeuTheme.acid,
                        onPressed: _fetchMatches,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Current Mentorship Pairs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Expanded(
                  child: pairs.isEmpty
                    ? const Center(child: Text("No pairs found."))
                    : ListView.builder(
                    itemCount: pairs.length,
                    itemBuilder: (context, index) {
                      final pair = pairs[index];
                      final mentor = pair['mentor'];
                      final mentee = pair['mentee'];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: NeuCard(
                          backgroundColor: Colors.white,
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: NeuTheme.acid,
                                      border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                      shape: BoxShape.circle
                                    ),
                                    child: const Icon(Icons.star, color: NeuTheme.ink, size: 20),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Mentor', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NeuTheme.ink)),
                                        Text(mentor['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 8.0),
                                child: Row(
                                  children: [
                                    Expanded(child: Divider(color: NeuTheme.ink, thickness: 2)),
                                    Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 8.0),
                                      child: Icon(Icons.handshake, color: NeuTheme.ink),
                                    ),
                                    Expanded(child: Divider(color: NeuTheme.ink, thickness: 2)),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: NeuTheme.sky,
                                      border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                      shape: BoxShape.circle
                                    ),
                                    child: const Icon(Icons.person, color: NeuTheme.ink, size: 20),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Mentee', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NeuTheme.ink)),
                                        Text(mentee['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                )
              ],
            ),
          ),
    );
  }
}
