import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
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

  Widget _buildHeroSection() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: SlideTransition(
          position: _slideAnimation,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildLanguageSwitcher(context),
              const SizedBox(height: 40),
              
              // Animated graphic placeholder (instead of 3D engine)
              Center(
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    color: NeuTheme.acid,
                    border: Border.all(color: NeuTheme.ink, width: 4),
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: const [
                      BoxShadow(
                        color: NeuTheme.ink,
                        offset: Offset(8, 8),
                      )
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.hub_outlined, size: 80, color: NeuTheme.ink),
                  ),
                ),
              ),
              const SizedBox(height: 40),
              
              const Text(
                "We don't predict placement.\nWe build the evidence.",
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: NeuTheme.ink,
                  height: 1.1,
                ),
                textAlign: TextAlign.left,
              ),
              const SizedBox(height: 24),
              const Text(
                'A single Grade → Skill → Readiness pipeline connecting students, faculty, administration, and recruiters in real-time.',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black54,
                ),
              ),
              const SizedBox(height: 32),
              NeuButton(
                text: 'Try the Demo',
                backgroundColor: NeuTheme.electric,
                textColor: Colors.white,
                onPressed: () => context.push('/login'),
              ),
              const SizedBox(height: 16),
              NeuButton(
                text: 'Register Account',
                backgroundColor: NeuTheme.sky,
                textColor: NeuTheme.ink,
                onPressed: () => context.push('/register'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPipelineSection() {
    final steps = [
      {'num': '01', 'title': 'Assess', 'desc': 'AI generates skill-mapped assessments aligned to industry standards', 'color': NeuTheme.electric},
      {'num': '02', 'title': 'Grade', 'desc': 'LangGraph agents auto-grade with rubric-based scoring', 'color': NeuTheme.sky},
      {'num': '03', 'title': 'Evidence', 'desc': 'Scores become verified entries on the Skill Evidence Graph (SEG)', 'color': NeuTheme.mint},
      {'num': '04', 'title': 'Place', 'desc': 'Recruiters discover talent through semantic vector matching', 'color': NeuTheme.hotpink},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      color: NeuTheme.paper,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'HOW IT WORKS',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: NeuTheme.electric, letterSpacing: 2),
          ),
          const SizedBox(height: 8),
          const Text(
            'The Pipeline That Changes Everything',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: NeuTheme.ink),
          ),
          const SizedBox(height: 32),
          ...steps.map((s) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: NeuCard(
              child: Row(
                children: [
                  Text(
                    s['num'] as String,
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: s['color'] as Color),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s['title'] as String, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(s['desc'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black54)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildDashboardsSection() {
    final dashboards = [
      {'role': 'Student', 'title': 'Learner Portal', 'color': NeuTheme.electric},
      {'role': 'Faculty', 'title': 'Classroom Hub', 'color': NeuTheme.sky},
      {'role': 'Admin', 'title': 'Command Center', 'color': NeuTheme.violet},
      {'role': 'Recruiter', 'title': 'Talent Exchange', 'color': NeuTheme.hotpink},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border.symmetric(horizontal: BorderSide(color: NeuTheme.ink, width: 4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'DASHBOARDS',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: NeuTheme.violet, letterSpacing: 2),
          ),
          const SizedBox(height: 8),
          const Text(
            'Four Dashboards, One Mission',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: NeuTheme.ink),
          ),
          const SizedBox(height: 32),
          ...dashboards.map((d) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: NeuCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: d['color'] as Color,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: NeuTheme.ink, width: 2),
                    ),
                    child: Text(
                      (d['role'] as String).toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(d['title'] as String, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeuTheme.paper,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              _buildHeroSection(),
              _buildPipelineSection(),
              _buildDashboardsSection(),
              
              // Footer CTA
              Container(
                padding: const EdgeInsets.symmetric(vertical: 64, horizontal: 24),
                color: NeuTheme.electric,
                width: double.infinity,
                child: Column(
                  children: [
                    const Text(
                      'Ready to see it live?',
                      style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    NeuButton(
                      text: 'Launch Interactive Demo',
                      backgroundColor: NeuTheme.acid,
                      textColor: NeuTheme.ink,
                      onPressed: () => context.push('/login'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
