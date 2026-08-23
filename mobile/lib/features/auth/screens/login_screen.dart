import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../providers/auth_provider.dart';

class DemoAccount {
  final String role;
  final String name;
  final String email;
  final String password;
  final IconData icon;
  final Color color;
  final String subtitle;

  const DemoAccount({
    required this.role,
    required this.name,
    required this.email,
    required this.password,
    required this.icon,
    required this.color,
    required this.subtitle,
  });
}

const List<DemoAccount> _demoAccounts = [
  DemoAccount(
    role: 'student',
    name: 'Arjun Reddy',
    email: 'arjun@mrdu.edu',
    password: 'test123',
    icon: Icons.school_rounded,
    color: Color(0xFF4B3AFF),
    subtitle: 'Learner Portal',
  ),
  DemoAccount(
    role: 'faculty',
    name: 'Prof. Lakshmi Naidu',
    email: 'lakshmi.naidu@mrdu.edu',
    password: 'faculty123',
    icon: Icons.menu_book_rounded,
    color: Color(0xFF3AC1FF),
    subtitle: 'Classroom Intelligence Hub',
  ),
  DemoAccount(
    role: 'admin',
    name: 'Dr. Srinivas Rao',
    email: 'admin@mrdu.edu',
    password: 'admin123',
    icon: Icons.shield_rounded,
    color: Color(0xFFA960FF),
    subtitle: 'Institutional Command Center',
  ),
  DemoAccount(
    role: 'recruiter',
    name: 'Ravi Menon',
    email: 'ravi@techspark.com',
    password: 'recruiter123',
    icon: Icons.work_rounded,
    color: Color(0xFFFF3D9A),
    subtitle: 'Talent Exchange',
  ),
];

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedRole = 'student';
  bool _isDemo = true;
  bool _showPassword = false;

  @override
  void initState() {
    super.initState();
    _selectDemoAccount(_demoAccounts.first);
  }

  void _selectDemoAccount(DemoAccount account) {
    setState(() {
      _selectedRole = account.role;
      _emailController.text = account.email;
      _passwordController.text = account.password;
    });
  }

  void _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter both email and password')),
      );
      return;
    }

    final success = await ref.read(authProvider.notifier).login(
      email,
      password,
      _selectedRole,
    );

    if (success && mounted) {
      final user = ref.read(authProvider).user;
      final role = user?['role'] ?? _selectedRole;
      context.go('/$role');
    }
  }

  Widget _buildLanguageSwitcher(BuildContext context) {
    return Align(
      alignment: Alignment.topRight,
      child: PopupMenuButton<Locale>(
        initialValue: context.locale,
        onSelected: (Locale locale) {
          context.setLocale(locale);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: NeuTheme.acid,
            border: Border.all(color: NeuTheme.ink, width: 2),
            borderRadius: BorderRadius.circular(8),
            boxShadow: const [
              BoxShadow(color: NeuTheme.ink, offset: Offset(2, 2)),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.language, size: 18, color: NeuTheme.ink),
              const SizedBox(width: 6),
              Text(
                context.locale.languageCode.toUpperCase(),
                style: const TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.ink),
              ),
            ],
          ),
        ),
        itemBuilder: (BuildContext context) => <PopupMenuEntry<Locale>>[
          const PopupMenuItem<Locale>(value: Locale('en'), child: Text('English (EN)')),
          const PopupMenuItem<Locale>(value: Locale('hi'), child: Text('हिंदी (HI)')),
          const PopupMenuItem<Locale>(value: Locale('mr'), child: Text('मराठी (MR)')),
          const PopupMenuItem<Locale>(value: Locale('te'), child: Text('తెలుగు (TE)')),
          const PopupMenuItem<Locale>(value: Locale('ta'), child: Text('தமிழ் (TA)')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final selectedAccount = _demoAccounts.firstWhere(
      (a) => a.role == _selectedRole,
      orElse: () => _demoAccounts.first,
    );

    return Scaffold(
      backgroundColor: NeuTheme.paper,
      appBar: AppBar(
        title: Text(
          'app_title'.tr(),
          style: const TextStyle(fontWeight: FontWeight.w900, color: NeuTheme.ink),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: NeuTheme.ink),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            Positioned(
              top: -50,
              left: -50,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  color: NeuTheme.electric.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              bottom: -50,
              right: -50,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  color: NeuTheme.hotpink.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildLanguageSwitcher(context),
                  const SizedBox(height: 12),
                  NeuCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'welcome_back'.tr(),
                          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: NeuTheme.ink),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'sign_in_dashboard'.tr(),
                          style: TextStyle(fontSize: 13, color: Colors.grey[600], fontWeight: FontWeight.w600),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),

                        // Toggle Demo vs Real Sign In
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            border: Border.all(color: NeuTheme.ink, width: 2.5),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: const [
                              BoxShadow(color: NeuTheme.ink, offset: Offset(3, 3)),
                            ],
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() => _isDemo = true);
                                    _selectDemoAccount(selectedAccount);
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: _isDemo ? NeuTheme.electric : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      border: _isDemo ? Border.all(color: NeuTheme.ink, width: 2) : null,
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      '🎮 ${'demo_access'.tr()}',
                                      style: TextStyle(
                                        color: _isDemo ? Colors.white : Colors.grey[700],
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _isDemo = false;
                                      _emailController.clear();
                                      _passwordController.clear();
                                    });
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: !_isDemo ? NeuTheme.hotpink : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      border: !_isDemo ? Border.all(color: NeuTheme.ink, width: 2) : null,
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      '🔐 ${'real_sign_in'.tr()}',
                                      style: TextStyle(
                                        color: !_isDemo ? Colors.white : Colors.grey[700],
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        if (_isDemo) ...[
                          Text(
                            'Choose a Demo Role',
                            style: TextStyle(fontSize: 13, color: Colors.grey[700], fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 12),

                          // 2x2 Grid of Role Cards matching Web Frontend
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 10,
                              mainAxisSpacing: 10,
                              childAspectRatio: 1.25,
                            ),
                            itemCount: _demoAccounts.length,
                            itemBuilder: (context, index) {
                              final account = _demoAccounts[index];
                              final isSelected = _selectedRole == account.role;

                              return GestureDetector(
                                onTap: () => _selectDemoAccount(account),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? account.color.withValues(alpha: 0.12)
                                        : Colors.white,
                                    border: Border.all(
                                      color: isSelected ? account.color : NeuTheme.ink,
                                      width: isSelected ? 3 : 2,
                                    ),
                                    borderRadius: BorderRadius.circular(14),
                                    boxShadow: [
                                      BoxShadow(
                                        color: isSelected ? account.color : NeuTheme.ink,
                                        offset: isSelected ? const Offset(4, 4) : const Offset(2, 2),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        width: 38,
                                        height: 38,
                                        decoration: BoxDecoration(
                                          color: account.color,
                                          border: Border.all(color: NeuTheme.ink, width: 2),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Icon(account.icon, size: 20, color: Colors.white),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        account.role.toUpperCase(),
                                        style: const TextStyle(
                                          color: NeuTheme.ink,
                                          fontWeight: FontWeight.w900,
                                          fontSize: 12,
                                        ),
                                      ),
                                      Text(
                                        account.name,
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontWeight: FontWeight.w600,
                                          fontSize: 10,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 16),

                          // Selected Account Details Banner
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: NeuTheme.acid.withValues(alpha: 0.3),
                              border: Border.all(color: NeuTheme.ink, width: 2),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: const [
                                BoxShadow(color: NeuTheme.ink, offset: Offset(2, 2)),
                              ],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: selectedAccount.color,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: NeuTheme.ink, width: 1.5),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    selectedAccount.name.characters.first,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        selectedAccount.name,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                      ),
                                      Text(
                                        selectedAccount.email,
                                        style: TextStyle(color: Colors.grey[700], fontSize: 11, fontFamily: 'monospace'),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                        ] else ...[
                          NeuInput(
                            hintText: 'email'.tr(),
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                          ),
                          const SizedBox(height: 14),
                          NeuInput(
                            hintText: 'password'.tr(),
                            controller: _passwordController,
                            obscureText: !_showPassword,
                          ),
                          const SizedBox(height: 20),
                        ],

                        if (authState.error != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: Colors.red[50],
                              border: Border.all(color: NeuTheme.coral, width: 2),
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: const [
                                BoxShadow(color: NeuTheme.coral, offset: Offset(2, 2)),
                              ],
                            ),
                            child: Text(
                              '⚠️ ${authState.error!}',
                              style: const TextStyle(color: NeuTheme.coral, fontWeight: FontWeight.bold, fontSize: 12),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],

                        NeuButton(
                          text: authState.isLoading
                              ? 'Signing In...'
                              : (_isDemo
                                  ? 'Enter as Demo ${selectedAccount.role.toUpperCase()}'
                                  : 'login'.tr()),
                          backgroundColor: _isDemo ? selectedAccount.color : NeuTheme.hotpink,
                          textColor: Colors.white,
                          onPressed: authState.isLoading ? () {} : _handleLogin,
                        ),
                        const SizedBox(height: 16),
                        GestureDetector(
                          onTap: () => context.push('/register'),
                          child: Text(
                            'dont_have_account'.tr(),
                            style: const TextStyle(
                              color: NeuTheme.electric,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
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
