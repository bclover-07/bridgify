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
  List<dynamic> branchStats = [];
  List<dynamic> skillDistribution = [];

  @override
  void initState() {
    super.initState();
    _fetchAnalytics();
  }

  Future<void> _fetchAnalytics() async {
    try {
      final response = await ApiClient.instance.get('/api/admin/analytics');
      setState(() {
        branchStats = response.data['branchStats'] ?? [];
        skillDistribution = response.data['skillDistribution'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        branchStats = [];
        skillDistribution = [];
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load analytics: ${e.toString()}')),
        );
      }
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
                if (branchStats.isNotEmpty)
                  NeuCard(
                    backgroundColor: NeuTheme.paper,
                    child: Column(
                      children: [
                        const Text('Student Distribution by Branch', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 200,
                          child: PieChart(
                            PieChartData(
                              sectionsSpace: 2,
                              centerSpaceRadius: 40,
                              sections: branchStats.asMap().entries.map((entry) {
                                final index = entry.key;
                                final stat = entry.value;
                                final colors = [NeuTheme.mint, NeuTheme.sky, NeuTheme.amber, NeuTheme.coral];
                                return PieChartSectionData(
                                  value: (stat['count'] ?? 0).toDouble(),
                                  color: colors[index % colors.length],
                                  title: stat['_id'] ?? 'Unknown',
                                  radius: 50,
                                  titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)
                                );
                              }).toList(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 24),
                if (skillDistribution.isNotEmpty)
                  NeuCard(
                    backgroundColor: Colors.white,
                    child: Column(
                      children: [
                        const Text('Skill Confidence by Category', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 200,
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
                                      if (value.toInt() < skillDistribution.length) {
                                        return Padding(
                                          padding: const EdgeInsets.only(top: 8),
                                          child: Text(skillDistribution[value.toInt()]['_id']?.toString().substring(0, 3) ?? '', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
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
                              barGroups: skillDistribution.asMap().entries.map((entry) {
                                final index = entry.key;
                                final stat = entry.value;
                                return BarChartGroupData(x: index, barRods: [BarChartRodData(toY: (stat['avgConfidence'] ?? 0).toDouble(), color: NeuTheme.coral, width: 20, borderRadius: BorderRadius.circular(2))]);
                              }).toList(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (branchStats.isEmpty && skillDistribution.isEmpty)
                  const Center(child: Padding(padding: EdgeInsets.all(32), child: Text("No analytics data found.")))
              ],
            ),
          ),
    );
  }
}
