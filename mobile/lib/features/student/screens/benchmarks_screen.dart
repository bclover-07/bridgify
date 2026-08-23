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
  List<dynamic> benchmarks = [];
  int overallPercentile = 0;

  @override
  void initState() {
    super.initState();
    _fetchBenchmarks();
  }

  Future<void> _fetchBenchmarks() async {
    try {
      final response = await ApiClient.instance.get('/api/student/benchmarks');
      final data = response.data['benchmarks'] as List<dynamic>? ?? [];
      
      int totalPercentile = 0;
      for (var b in data) {
        totalPercentile += (b['percentile'] as num).toInt();
      }
      
      setState(() {
        benchmarks = data.take(5).toList(); // Show top 5 skills
        overallPercentile = data.isEmpty ? 0 : totalPercentile ~/ data.length;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        benchmarks = []; // No mock data
        overallPercentile = 0;
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load benchmarks: ${e.toString()}')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: NeuTheme.orange)),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Benchmarks'),
        backgroundColor: NeuTheme.orange,
        foregroundColor: NeuTheme.ink,
      ),
      body: PageTransition(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              StaggerItem(
                index: 0,
                child: NeuCard(
                  backgroundColor: NeuTheme.paper,
                  child: Column(
                    children: [
                      const Text('Your Overall Percentile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(
                        '$overallPercentile%',
                        style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: NeuTheme.orange),
                      ),
                      const Text('Compared to cohort maximums', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              StaggerItem(
                index: 1,
                child: const Text('Skill Comparison (You vs Cohort Max)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 16),
              if (benchmarks.isEmpty)
                const Center(child: Text('No skill data available to benchmark against.'))
              else ...[
                StaggerItem(
                  index: 2,
                  child: SizedBox(
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
                                  if (value.toInt() < benchmarks.length) {
                                    String label = benchmarks[value.toInt()]['skillLabel'] ?? 'Skill';
                                    if (label.length > 8) {
                                      label = '${label.substring(0, 6)}..';
                                    }
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(
                                        label,
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
                          barGroups: benchmarks.asMap().entries.map((entry) {
                            final index = entry.key;
                            final comp = entry.value;
                            return BarChartGroupData(
                              x: index,
                              barRods: [
                                BarChartRodData(
                                  toY: (comp['myScore'] as num).toDouble(),
                                  color: NeuTheme.orange,
                                  width: 15,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                                BarChartRodData(
                                  toY: (comp['cohortMax'] as num).toDouble(),
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
                ),
                const SizedBox(height: 16),
                StaggerItem(
                  index: 3,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(width: 12, height: 12, color: NeuTheme.orange),
                      const SizedBox(width: 8),
                      const Text('You', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 24),
                      Container(width: 12, height: 12, color: NeuTheme.ink),
                      const SizedBox(width: 8),
                      const Text('Cohort Max', style: TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}
