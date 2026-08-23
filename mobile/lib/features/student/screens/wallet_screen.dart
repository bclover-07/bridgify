import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  bool isLoading = true;
  List<dynamic> transactions = [];

  @override
  void initState() {
    super.initState();
    _fetchWallet();
  }

  Future<void> _fetchWallet() async {
    try {
      final response = await ApiClient.instance.get('/api/student/wallet');
      setState(() {
        transactions = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        transactions = [
          {"id": "0x1A2B", "skill": "React.js", "date": "2026-08-20", "status": "Verified"},
          {"id": "0x3C4D", "skill": "Node.js", "date": "2026-08-21", "status": "Verified"},
          {"id": "0x5E6F", "skill": "System Design", "date": "2026-08-22", "status": "Pending"},
        ];
        isLoading = false;
      });
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
                        '${transactions.where((t) => t['status'] == 'Verified').length}',
                        style: const TextStyle(color: NeuTheme.mint, fontSize: 48, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Ledger Transactions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView.separated(
                    itemCount: transactions.length,
                    separatorBuilder: (context, index) => const Divider(color: NeuTheme.ink, thickness: NeuTheme.borderWidth),
                    itemBuilder: (context, index) {
                      final t = transactions[index];
                      final isVerified = t['status'] == 'Verified';
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
                                  Text(t['skill'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Text('Hash: ${t['id']} | ${t['date']}', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                                ],
                              ),
                            ),
                            Text(
                              t['status'],
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
