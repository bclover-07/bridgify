import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class DropoutRadarScreen extends ConsumerStatefulWidget {
  const DropoutRadarScreen({super.key});

  @override
  ConsumerState<DropoutRadarScreen> createState() => _DropoutRadarScreenState();
}

class _DropoutRadarScreenState extends ConsumerState<DropoutRadarScreen> with SingleTickerProviderStateMixin {
  bool isLoading = true;
  List<dynamic> students = [];
  String courseName = "Radar";
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _fetchRiskStudents();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _fetchRiskStudents() async {
    try {
      final coursesRes = await ApiClient.instance.get('/api/faculty/courses');
      final courses = coursesRes.data['courses'] as List<dynamic>? ?? [];
      
      if (courses.isEmpty) {
        setState(() => isLoading = false);
        return;
      }

      final courseId = courses[0]['_id'];

      final response = await ApiClient.instance.get('/api/faculty/dropout-radar/$courseId');
      setState(() {
        courseName = response.data['courseName'] ?? "Radar";
        students = response.data['students'] ?? [];
        // Only show High/Medium risk students
        students = students.where((s) => s['riskLevel'] == 'HIGH' || s['riskLevel'] == 'MEDIUM').toList();
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        students = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load dropout radar: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('$courseName - Dropout Radar'),
        backgroundColor: NeuTheme.coral,
        foregroundColor: Colors.white,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.coral))
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                NeuCard(
                  backgroundColor: NeuTheme.ink,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ScaleTransition(
                        scale: _pulseAnimation,
                        child: const Icon(Icons.radar, color: NeuTheme.coral, size: 48),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('At Risk Students', style: TextStyle(color: Colors.white70, fontSize: 16)),
                          Text(
                            '${students.length}',
                            style: const TextStyle(color: NeuTheme.coral, fontSize: 40, fontWeight: FontWeight.w900),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Intervention Required', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Expanded(
                  child: students.isEmpty 
                  ? const Center(child: Text("No at-risk students found.", style: TextStyle(fontSize: 16)))
                  : ListView.builder(
                    itemCount: students.length,
                    itemBuilder: (context, index) {
                      final s = students[index];
                      final isHighRisk = s['riskLevel'] == 'HIGH';
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: NeuCard(
                          backgroundColor: isHighRisk ? NeuTheme.coral.withOpacity(0.2) : NeuTheme.amber.withOpacity(0.2),
                          child: Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: isHighRisk ? NeuTheme.coral : NeuTheme.amber,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                ),
                                child: const Center(
                                  child: Icon(Icons.warning, color: Colors.white),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(s['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                    Text('Roll No: ${s['rollNo'] ?? 'N/A'} | Risk: ${s['riskLevel']}', style: TextStyle(color: Colors.grey[800], fontSize: 12)),
                                    const SizedBox(height: 4),
                                    Text('Attendance: ${s['attendanceRate'] ?? 0}% | Score: ${s['recentAvgScore'] ?? 0}%', style: TextStyle(color: Colors.grey[800], fontSize: 12, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              NeuButton(
                                text: 'Alert',
                                backgroundColor: NeuTheme.ink,
                                textColor: Colors.white,
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Alert dispatched (Not Implemented)')));
                                },
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
