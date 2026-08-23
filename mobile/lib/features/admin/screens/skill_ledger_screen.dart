import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class SkillLedgerScreen extends ConsumerStatefulWidget {
  const SkillLedgerScreen({super.key});

  @override
  ConsumerState<SkillLedgerScreen> createState() => _SkillLedgerScreenState();
}

class _SkillLedgerScreenState extends ConsumerState<SkillLedgerScreen> {
  bool isLoading = true;
  List<dynamic> ledgerData = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchLedger();
  }

  Future<void> _fetchLedger() async {
    try {
      final response = await ApiClient.instance.get('/api/admin/skill-ledger');
      setState(() {
        ledgerData = response.data['ledger'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        ledgerData = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load ledger: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Master Skill Ledger'),
        backgroundColor: NeuTheme.mint,
        foregroundColor: NeuTheme.ink,
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator(color: NeuTheme.mint))
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                NeuCard(
                  backgroundColor: NeuTheme.ink,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Total Aggregated Skills', style: TextStyle(color: Colors.white70)),
                          Text('${ledgerData.length}', style: const TextStyle(color: NeuTheme.mint, fontSize: 32, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const Icon(Icons.verified, color: NeuTheme.mint, size: 48),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                NeuInput(
                  controller: _searchController,
                  hintText: 'Search Skill Name or Category...',
                  onChanged: (v) => setState(() {}),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: NeuCard(
                    backgroundColor: Colors.white,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: SingleChildScrollView(
                        child: DataTable(
                          headingRowColor: MaterialStateProperty.all(NeuTheme.mint),
                          columns: const [
                            DataColumn(label: Text('Skill', style: TextStyle(fontWeight: FontWeight.bold))),
                            DataColumn(label: Text('Category', style: TextStyle(fontWeight: FontWeight.bold))),
                            DataColumn(label: Text('Students', style: TextStyle(fontWeight: FontWeight.bold))),
                            DataColumn(label: Text('Evidences', style: TextStyle(fontWeight: FontWeight.bold))),
                            DataColumn(label: Text('Avg Confidence', style: TextStyle(fontWeight: FontWeight.bold))),
                          ],
                          rows: ledgerData.where((element) {
                            if (_searchController.text.isEmpty) return true;
                            final q = _searchController.text.toLowerCase();
                            final label = (element['skillLabel'] ?? '').toString().toLowerCase();
                            final category = (element['skillCategory'] ?? '').toString().toLowerCase();
                            return label.contains(q) || category.contains(q);
                          }).map((item) => DataRow(
                            cells: [
                              DataCell(Text(item['skillLabel'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.electric))),
                              DataCell(Text(item['skillCategory'] ?? 'N/A')),
                              DataCell(Text((item['studentCount'] ?? 0).toString())),
                              DataCell(Text((item['evidenceCount'] ?? 0).toString())),
                              DataCell(Text((item['avgConfidence'] ?? 0).toStringAsFixed(1))),
                            ],
                          )).toList(),
                        ),
                      ),
                    ),
                  ),
                )
              ],
            ),
          ),
    );
  }
}
