import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAnalytics();
  }

  Future<void> _fetchAnalytics() async {
    try {
      await ApiClient.instance.get('/api/admin/analytics');
      setState(() => isLoading = false);
    } catch (e) {
      // Mock data is hardcoded in the charts
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Institution Analytics'),
        backgroundColor: NeuTheme.coral,
        foregroundColor: Colors.white,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.coral))
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                NeuCard(
                  backgroundColor: NeuTheme.paper,
                  child: Column(
                    children: [
                      const Text('Placement Distribution by Branch', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 200,
                        child: PieChart(
                          PieChartData(
                            sectionsSpace: 2,
                            centerSpaceRadius: 40,
                            sections: [
                              PieChartSectionData(value: 40, color: NeuTheme.mint, title: 'CSE', radius: 50, titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              PieChartSectionData(value: 30, color: NeuTheme.sky, title: 'ECE', radius: 50, titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              PieChartSectionData(value: 20, color: NeuTheme.amber, title: 'IT', radius: 50, titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              PieChartSectionData(value: 10, color: NeuTheme.coral, title: 'MECH', radius: 50, titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                NeuCard(
                  backgroundColor: Colors.white,
                  child: Column(
                    children: [
                      const Text('Average Package (LPA) by Year', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 200,
                        child: BarChart(
                          BarChartData(
                            alignment: BarChartAlignment.spaceAround,
                            maxY: 15,
                            barTouchData: BarTouchData(enabled: false),
                            titlesData: FlTitlesData(
                              show: true,
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (value, meta) {
                                    final years = ['2023', '2024', '2025', '2026'];
                                    if (value.toInt() < years.length) {
                                      return Padding(
                                        padding: const EdgeInsets.only(top: 8),
                                        child: Text(years[value.toInt()], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
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
                            barGroups: [
                              BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 6.5, color: NeuTheme.coral, width: 20, borderRadius: BorderRadius.circular(2))]),
                              BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 8.2, color: NeuTheme.coral, width: 20, borderRadius: BorderRadius.circular(2))]),
                              BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 10.5, color: NeuTheme.coral, width: 20, borderRadius: BorderRadius.circular(2))]),
                              BarChartGroupData(x: 3, barRods: [BarChartRodData(toY: 12.0, color: NeuTheme.coral, width: 20, borderRadius: BorderRadius.circular(2))]),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
    );
  }
}
