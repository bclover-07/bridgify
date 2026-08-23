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
      final response = await ApiClient.instance.get('/api/admin/ledger');
      setState(() {
        ledgerData = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        ledgerData = [
          {"hash": "0x8F9A", "student": "Arjun Kumar", "skill": "React.js", "date": "2026-08-20"},
          {"hash": "0x3C4D", "student": "Sarah Lee", "skill": "Data Structures", "date": "2026-08-21"},
          {"hash": "0x1A2B", "student": "Ravi Patel", "skill": "System Design", "date": "2026-08-22"},
          {"hash": "0x9B8C", "student": "Priya Singh", "skill": "Node.js", "date": "2026-08-22"},
        ];
        isLoading = false;
      });
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
                          const Text('Total Verified Skills', style: TextStyle(color: Colors.white70)),
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
                  hintText: 'Search Hash or Student...',
                  onChanged: (v) => setState(() {}),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: NeuCard(
                    backgroundColor: Colors.white,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        headingRowColor: MaterialStateProperty.all(NeuTheme.mint),
                        columns: const [
                          DataColumn(label: Text('Tx Hash', style: TextStyle(fontWeight: FontWeight.bold))),
                          DataColumn(label: Text('Student', style: TextStyle(fontWeight: FontWeight.bold))),
                          DataColumn(label: Text('Skill', style: TextStyle(fontWeight: FontWeight.bold))),
                          DataColumn(label: Text('Timestamp', style: TextStyle(fontWeight: FontWeight.bold))),
                        ],
                        rows: ledgerData.where((element) {
                          if (_searchController.text.isEmpty) return true;
                          final q = _searchController.text.toLowerCase();
                          return element['hash'].toLowerCase().contains(q) ||
                                 element['student'].toLowerCase().contains(q);
                        }).map((item) => DataRow(
                          cells: [
                            DataCell(Text(item['hash'], style: const TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.electric))),
                            DataCell(Text(item['student'])),
                            DataCell(Text(item['skill'])),
                            DataCell(Text(item['date'])),
                          ],
                        )).toList(),
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
