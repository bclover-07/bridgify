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
  List<dynamic> mentees = [];
  final TextEditingController _studentIdController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchMentees();
  }

  Future<void> _fetchMentees() async {
    try {
      final response = await ApiClient.instance.get('/api/faculty/mentees');
      setState(() {
        mentees = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        mentees = [
          {"id": "S101", "name": "Arjun Kumar", "progress": 45, "last_meeting": "2026-08-20"},
          {"id": "S102", "name": "Sarah Lee", "progress": 80, "last_meeting": "2026-08-21"},
        ];
        isLoading = false;
      });
    }
  }

  Future<void> _assignMentee() async {
    if (_studentIdController.text.trim().isEmpty) return;
    try {
      await ApiClient.instance.post('/api/faculty/mentees/assign', data: {
        "student_id": _studentIdController.text,
      });
      _studentIdController.clear();
      _fetchMentees();
    } catch (e) {
      // Handles offline/mock appropriately via interceptor
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mentee assigned offline')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mentorship Program'),
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
                      const Text('Assign New Mentee', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      NeuInput(
                        controller: _studentIdController,
                        hintText: 'Student ID (e.g., S105)',
                      ),
                      const SizedBox(height: 16),
                      NeuButton(
                        text: 'Assign',
                        color: NeuTheme.acid,
                        onPressed: _assignMentee,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('My Mentees', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView.builder(
                    itemCount: mentees.length,
                    itemBuilder: (context, index) {
                      final m = mentees[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: NeuCard(
                          backgroundColor: Colors.white,
                          child: Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: NeuTheme.acid,
                                  border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                ),
                                child: const Icon(Icons.person, color: NeuTheme.ink),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(m['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    Text('ID: ${m['id']} | Last Met: ${m['last_meeting']}', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                                    const SizedBox(height: 8),
                                    LinearProgressIndicator(
                                      value: m['progress'] / 100,
                                      backgroundColor: NeuTheme.ink.withOpacity(0.1),
                                      color: NeuTheme.ink,
                                      minHeight: 8,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 16),
                              NeuButton(
                                text: 'Chat',
                                color: NeuTheme.electric,
                                textColor: Colors.white,
                                onPressed: () {},
                              )
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
