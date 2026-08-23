import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';
import 'package:intl/intl.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  bool isLoading = true;
  List<dynamic> transactions = [];
  int verifiedSkillsCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchWallet();
  }

  Future<void> _fetchWallet() async {
    try {
      final response = await ApiClient.instance.get('/api/student/seg');
      final edges = response.data['edges'] as List<dynamic>? ?? [];
      final nodes = response.data['nodes'] as List<dynamic>? ?? [];
      
      setState(() {
        transactions = edges;
        verifiedSkillsCount = nodes.length;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        transactions = []; // No mock data
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load wallet: ${e.toString()}')));
      }
    }
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('yyyy-MM-dd HH:mm').format(date);
    } catch (e) {
      return isoString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Skill Wallet (Blockchain)'),
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
                  child: Column(
                    children: [
                      const Text(
                        'Total Verified Skills',
                        style: TextStyle(color: Colors.white70, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '$verifiedSkillsCount',
                        style: const TextStyle(color: NeuTheme.mint, fontSize: 48, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Ledger Transactions (Evidence Logs)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Expanded(
                  child: transactions.isEmpty 
                  ? const Center(child: Text("No transactions recorded on the ledger."))
                  : ListView.separated(
                    itemCount: transactions.length,
                    separatorBuilder: (context, index) => const Divider(color: NeuTheme.ink, thickness: NeuTheme.borderWidth),
                    itemBuilder: (context, index) {
                      final t = transactions[index];
                      // For this simulation, all returned edges are verified.
                      final isVerified = true; 
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: isVerified ? NeuTheme.mint : NeuTheme.amber,
                                border: Border.all(color: NeuTheme.ink, width: NeuTheme.borderWidth),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Icon(isVerified ? Icons.verified : Icons.pending, size: 24),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(t['evidenceType'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Text('${t['context']} | ${_formatDate(t['timestamp'] ?? '')}', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                                ],
                              ),
                            ),
                            Text(
                              '+${t['scoreContributed'] ?? 0}',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                color: isVerified ? NeuTheme.mint : NeuTheme.amber,
                              ),
                            )
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
    );
  }
}
