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
      final response = await ApiClient.instance.get('/api/faculty/radar');
      setState(() {
        students = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        students = [
          {"id": "S101", "name": "Arjun Kumar", "risk_level": "High", "attendance": 45, "score": 30},
          {"id": "S105", "name": "Priya Singh", "risk_level": "Medium", "attendance": 65, "score": 55},
        ];
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dropout Radar'),
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
                  child: ListView.builder(
                    itemCount: students.length,
                    itemBuilder: (context, index) {
                      final s = students[index];
                      final isHighRisk = s['risk_level'] == 'High';
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
                                    Text(s['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                    Text('ID: ${s['id']} | Risk: ${s['risk_level']}', style: TextStyle(color: Colors.grey[800], fontSize: 12)),
                                    const SizedBox(height: 4),
                                    Text('Attendance: ${s['attendance']}% | Score: ${s['score']}%', style: TextStyle(color: Colors.grey[800], fontSize: 12, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              NeuButton(
                                text: 'Alert',
                                color: NeuTheme.ink,
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
