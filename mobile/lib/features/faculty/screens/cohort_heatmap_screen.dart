import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class CohortHeatmapScreen extends ConsumerStatefulWidget {
  const CohortHeatmapScreen({super.key});

  @override
  ConsumerState<CohortHeatmapScreen> createState() => _CohortHeatmapScreenState();
}

class _CohortHeatmapScreenState extends ConsumerState<CohortHeatmapScreen> {
  bool isLoading = true;
  List<dynamic> distribution = [];
  String courseName = "Cohort";

  @override
  void initState() {
    super.initState();
    _fetchHeatmap();
  }

  Future<void> _fetchHeatmap() async {
    try {
      // Fetch courses to get the first course ID
      final coursesRes = await ApiClient.instance.get('/api/faculty/courses');
      final courses = coursesRes.data['courses'] as List<dynamic>? ?? [];
      
      if (courses.isEmpty) {
        setState(() => isLoading = false);
        return;
      }

      final courseId = courses[0]['_id'];

      final response = await ApiClient.instance.get('/api/faculty/cohort-heatmap/$courseId');
      final skills = response.data['skills'] as List<dynamic>? ?? [];
      
      setState(() {
        courseName = response.data['courseName'] ?? "Cohort";
        distribution = skills.map((s) {
          final avg = s['cohortAvg'] ?? 0;
          String status = 'Good';
          if (avg < 50) status = 'Critical';
          else if (avg < 75) status = 'Needs Attention';
          
          return {
            "topic": s['skillLabel'] ?? 'Unknown',
            "avg_score": avg,
            "status": status,
          };
        }).toList();
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        distribution = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load heatmap: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('$courseName Heatmap'),
        backgroundColor: NeuTheme.violet,
        foregroundColor: Colors.white,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.violet))
        : distribution.isEmpty 
          ? const Center(child: Text("No heatmap data available."))
          : SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                NeuCard(
                  backgroundColor: NeuTheme.paper,
                  child: Column(
                    children: [
                      const Text('Overall Performance Trend', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 200,
                        child: LineChart(
                          LineChartData(
                            gridData: const FlGridData(show: false),
                            titlesData: const FlTitlesData(
                              leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
                              bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            ),
                            borderData: FlBorderData(show: true, border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth)),
                            lineBarsData: [
                              LineChartBarData(
                                spots: distribution.asMap().entries.map((e) => FlSpot(e.key.toDouble(), (e.value['avg_score'] ?? 0).toDouble())).toList(),
                                isCurved: true,
                                color: NeuTheme.violet,
                                barWidth: 4,
                                isStrokeCapRound: true,
                                belowBarData: BarAreaData(
                                  show: true,
                                  color: NeuTheme.violet.withOpacity(0.3),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Topic Distribution', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                ...distribution.map((d) {
                  final isCritical = d['status'] == 'Critical';
                  final isNeedsAttention = d['status'] == 'Needs Attention';
                  
                  Color bgColor = NeuTheme.mint;
                  if (isCritical) bgColor = NeuTheme.coral;
                  else if (isNeedsAttention) bgColor = NeuTheme.amber;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: NeuCard(
                      backgroundColor: bgColor.withOpacity(0.2),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(d['topic'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                Text(d['status'], style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: bgColor,
                              border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '${d['avg_score']}%',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
                            ),
                          )
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
    );
  }
}
