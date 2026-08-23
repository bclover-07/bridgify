import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../providers/auth_provider.dart';

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

  final List<String> _roles = ['student', 'faculty', 'admin', 'recruiter'];

  @override
  void initState() {
    super.initState();
    // Pre-fill the default demo role credentials
    _handleSelectDemo(_selectedRole);
  }

  void _handleSelectDemo(String role) {
    setState(() {
      _selectedRole = role;
      switch (role) {
        case 'student':
          _emailController.text = 'arjun@mrdu.edu';
          _passwordController.text = 'Bridgify@2026';
          break;
        case 'faculty':
          _emailController.text = 'lakshmi.naidu@mrdu.edu';
          _passwordController.text = 'Bridgify@2026';
          break;
        case 'admin':
          _emailController.text = 'admin@mrdu.edu';
          _passwordController.text = 'Bridgify@2026';
          break;
        case 'recruiter':
          _emailController.text = 'ravi@techspark.com';
          _passwordController.text = 'Bridgify@2026';
          break;
      }
    });
  }

  void _handleLogin() async {
    final success = await ref.read(authProvider.notifier).login(
      _emailController.text, 
      _passwordController.text, 
      _selectedRole // Only used if needed, backend determines actual role
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
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.language, size: 18, color: NeuTheme.ink),
              const SizedBox(width: 8),
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

    return Scaffold(
      backgroundColor: NeuTheme.paper,
      appBar: AppBar(
        title: Text('app_title'.tr(), style: const TextStyle(fontWeight: FontWeight.w900, color: NeuTheme.ink)),
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
                decoration: BoxDecoration(color: NeuTheme.electric.withOpacity(0.1), shape: BoxShape.circle),
              ),
            ),
            Positioned(
              bottom: -50,
              right: -50,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(color: NeuTheme.hotpink.withOpacity(0.1), shape: BoxShape.circle),
              ),
            ),
            SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildLanguageSwitcher(context),
                  const SizedBox(height: 20),
                  NeuCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'welcome_back'.tr(),
                          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: NeuTheme.ink),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'sign_in_dashboard'.tr(),
                          style: const TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        
                        // Toggle Demo vs Real Sign In
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            border: Border.all(color: NeuTheme.ink, width: 3),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _isDemo = true),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    decoration: BoxDecoration(
                                      color: _isDemo ? NeuTheme.electric : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                      border: _isDemo ? Border.all(color: NeuTheme.ink, width: 2) : null,
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      'demo_access'.tr(),
                                      style: TextStyle(
                                        color: _isDemo ? Colors.white : Colors.grey[600],
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _isDemo = false),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    decoration: BoxDecoration(
                                      color: !_isDemo ? NeuTheme.hotpink : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                      border: !_isDemo ? Border.all(color: NeuTheme.ink, width: 2) : null,
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      'real_sign_in'.tr(),
                                      style: TextStyle(
                                        color: !_isDemo ? Colors.white : Colors.grey[600],
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        if (_isDemo) ...[
                          Text(
                            'Click a role to auto-fill credentials',
                            style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            alignment: WrapAlignment.center,
                            children: _roles.map((role) {
                              final isSelected = _selectedRole == role;
                              return GestureDetector(
                                onTap: () => _handleSelectDemo(role),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: isSelected ? NeuTheme.acid : Colors.white,
                                    border: Border.all(color: NeuTheme.ink, width: isSelected ? 3 : 2),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    role.tr(),
                                    style: TextStyle(
                                      color: NeuTheme.ink,
                                      fontWeight: FontWeight.bold,
                                      fontSize: isSelected ? 16 : 14,
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 24),
                        ] else ...[
                          NeuInput(
                            hintText: 'email'.tr(),
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                          ),
                          const SizedBox(height: 16),
                          NeuInput(
                            hintText: 'password'.tr(),
                            controller: _passwordController,
                            obscureText: !_showPassword,
                          ),
                          const SizedBox(height: 24),
                        ],
                        
                        if (authState.error != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: Colors.red[50],
                              border: Border.all(color: NeuTheme.coral, width: 2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '⚠️ ${authState.error!}',
                              style: const TextStyle(color: NeuTheme.coral, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],

                        NeuButton(
                          text: authState.isLoading ? '...' : (_isDemo ? 'Sign In as ${_selectedRole.tr()}' : 'login'.tr()),
                          backgroundColor: _isDemo ? NeuTheme.electric : NeuTheme.hotpink,
                          textColor: Colors.white,
                          onPressed: authState.isLoading ? () {} : _handleLogin,
                        ),
                        const SizedBox(height: 16),
                        GestureDetector(
                          onTap: () => context.push('/register'),
                          child: Text(
                            'dont_have_account'.tr(),
                            style: const TextStyle(color: NeuTheme.electric, fontWeight: FontWeight.bold, fontSize: 14),
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
