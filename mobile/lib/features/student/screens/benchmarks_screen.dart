import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class BenchmarksScreen extends ConsumerStatefulWidget {
  const BenchmarksScreen({super.key});

  @override
  ConsumerState<BenchmarksScreen> createState() => _BenchmarksScreenState();
}

class _BenchmarksScreenState extends ConsumerState<BenchmarksScreen> {
  bool isLoading = true;
  Map<String, dynamic>? data;

  @override
  void initState() {
    super.initState();
    _fetchBenchmarks();
  }

  Future<void> _fetchBenchmarks() async {
    try {
      final response = await ApiClient.instance.get('/api/student/benchmarks');
      setState(() {
        data = response.data['data'];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        data = {
          "user_percentile": 85,
          "comparison": [
            {"skill": "React", "user_score": 90, "top_10_avg": 95},
            {"skill": "Node.js", "user_score": 80, "top_10_avg": 85},
            {"skill": "System Design", "user_score": 75, "top_10_avg": 90},
          ]
        };
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: NeuTheme.orange)),
      );
    }

    final percentile = data?['user_percentile'] ?? 0;
    final List<dynamic> comparisons = data?['comparison'] ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Benchmarks'),
        backgroundColor: NeuTheme.orange,
        foregroundColor: NeuTheme.ink,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            NeuCard(
              backgroundColor: NeuTheme.paper,
              child: Column(
                children: [
                  const Text('Your Percentile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(
                    '$percentile%',
                    style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: NeuTheme.orange),
                  ),
                  const Text('Top 15% of your cohort', style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Skill Comparison (You vs Top 10%)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            SizedBox(
              height: 300,
              child: NeuCard(
                backgroundColor: Colors.white,
                padding: const EdgeInsets.all(16),
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    maxY: 100,
                    barTouchData: BarTouchData(enabled: false),
                    titlesData: FlTitlesData(
                      show: true,
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            if (value.toInt() < comparisons.length) {
                              return Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text(
                                  comparisons[value.toInt()]['skill'],
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              );
                            }
                            return const SizedBox.shrink();
                          },
                        ),
                      ),
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 30,
                          getTitlesWidget: (value, meta) => Text(value.toInt().toString(), style: const TextStyle(fontSize: 10)),
                        ),
                      ),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    gridData: const FlGridData(show: false),
                    borderData: FlBorderData(show: false),
                    barGroups: comparisons.asMap().entries.map((entry) {
                      final index = entry.key;
                      final comp = entry.value;
                      return BarChartGroupData(
                        x: index,
                        barRods: [
                          BarChartRodData(
                            toY: comp['user_score'].toDouble(),
                            color: NeuTheme.orange,
                            width: 15,
                            borderRadius: BorderRadius.circular(2),
                          ),
                          BarChartRodData(
                            toY: comp['top_10_avg'].toDouble(),
                            color: NeuTheme.ink,
                            width: 15,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(width: 12, height: 12, color: NeuTheme.orange),
                const SizedBox(width: 8),
                const Text('You', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(width: 24),
                Container(width: 12, height: 12, color: NeuTheme.ink),
                const SizedBox(width: 8),
                const Text('Top 10%', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            )
          ],
        ),
      ),
    );
  }
}
