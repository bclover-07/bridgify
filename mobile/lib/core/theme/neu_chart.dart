import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'neu_theme.dart';

class NeuRadarChart extends StatelessWidget {
  final List<Map<String, dynamic>> data;
  final double height;

  const NeuRadarChart({
    super.key,
    required this.data,
    this.height = 280,
  });

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return SizedBox(
        height: height,
        child: const Center(child: Text("Not enough data for radar chart")),
      );
    }

    return SizedBox(
      height: height,
      child: RadarChart(
        RadarChartData(
          radarShape: RadarShape.polygon,
          tickCount: 4,
          dataSets: [
            RadarDataSet(
              fillColor: NeuTheme.electric.withOpacity(0.3),
              borderColor: NeuTheme.electric,
              entryRadius: 3,
              dataEntries: data.map((e) => RadarEntry(value: (e['score'] as num).toDouble())).toList(),
              borderWidth: 2,
            ),
          ],
          titlePositionPercentageOffset: 0.1,
          getTitle: (index, angle) {
            String label = data[index]['name'] ?? 'Skill';
            if (label.length > 10) label = '${label.substring(0, 8)}..';
            return RadarChartTitle(
              text: label,
              angle: 0,
              // Using a fixed TextStyle to avoid relying on complex context access here
            );
          },
          radarBorderData: const BorderSide(color: NeuTheme.ink, width: 2),
          tickBorderData: const BorderSide(color: Colors.black12, width: 1),
          gridBorderData: const BorderSide(color: Colors.black12, width: 1),
          radarBackgroundColor: Colors.transparent,
        ),
        swapAnimationDuration: const Duration(milliseconds: 400),
        swapAnimationCurve: Curves.easeInOut,
      ),
    );
  }
}
