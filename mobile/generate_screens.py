import os

# Base paths
BASE_DIR = r"c:\Users\rocke\OneDrive\Desktop\bridgify\mobile\lib\features"

features = {
    'faculty': [
        'Notes', 'PPT Maker', 'Dropout Radar', 'Cohort Heatmap', 
        'Lecture Bridge', 'Mentorship', 'Learning Feed', 'Assessments'
    ],
    'admin': [
        'Student Directory', 'Placement CC', 'NAAC Report', 'Skill Ledger', 'Analytics'
    ],
    'recruiter': [
        'Candidate Search', 'PS Generator', 'Marketplace', 'Pipeline', 'Fair Hiring', 'Feedback'
    ]
}

def to_snake_case(name):
    return name.lower().replace(' ', '_')

def to_camel_case(name):
    return ''.join(word.capitalize() for word in name.split(' '))

template = """import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class {ClassName}Screen extends ConsumerStatefulWidget {{
  const {ClassName}Screen({{super.key}});

  @override
  ConsumerState<{ClassName}Screen> createState() => _{ClassName}ScreenState();
}}

class _{ClassName}ScreenState extends ConsumerState<{ClassName}Screen> {{
  bool isLoading = true;
  List<dynamic> data = [];

  @override
  void initState() {{
    super.initState();
    _fetchData();
  }}

  Future<void> _fetchData() async {{
    try {{
      // Automatically routed offline request via ApiClient's interceptor
      final response = await ApiClient.instance.get('/api/{role}/{endpoint}');
      setState(() {{
        data = response.data['data'] ?? [];
        isLoading = false;
      }});
    }} catch (e) {{
      setState(() => isLoading = false);
    }}
  }}

  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(
        title: const Text('{Title}'),
        backgroundColor: NeuTheme.electric,
        foregroundColor: Colors.white,
      ),
      body: isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: data.isEmpty ? 1 : data.length,
            itemBuilder: (context, index) {{
              if (data.isEmpty) {{
                return const Center(child: Text('No data found from backend'));
              }}
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: NeuCard(
                  child: Text(data[index].toString()),
                ),
              );
            }},
          ),
    );
  }}
}}
"""

for role, screens in features.items():
    role_dir = os.path.join(BASE_DIR, role, 'screens')
    os.makedirs(role_dir, exist_ok=True)
    
    for screen in screens:
        class_name = to_camel_case(screen)
        file_name = f"{to_snake_case(screen)}_screen.dart"
        endpoint = to_snake_case(screen)
        
        content = template.format(ClassName=class_name, Title=screen, role=role, endpoint=endpoint)
        with open(os.path.join(role_dir, file_name), 'w') as f:
            f.write(content)

print("Scaffolding complete.")
