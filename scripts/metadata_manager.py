#!/usr/bin/env python3
"""
Metadata manager for legal references - handles timestamp and metadata operations.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class MetadataManager:
    def __init__(self):
        self.metadata_cache = {}
    
    def add_metadata(self, article: Dict) -> Dict:
        """Add metadata fields to an article."""
        # Ensure required fields exist
        if 'lastUpdated' not in article:
            article['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'
        
        if 'checksum' not in article:
            from content_tracker import ContentTracker
            tracker = ContentTracker()
            article['checksum'] = tracker.generate_checksum(article.get('content', ''))
        
        # Add additional metadata if not present
        if 'firstSeen' not in article:
            article['firstSeen'] = article['lastUpdated']
        
        return article
    
    def enhance_legal_references(self, references: List[Dict], tracker=None) -> List[Dict]:
        """Enhance legal references with metadata."""
        enhanced_references = []
        
        for ref in references:
            # Create a copy to avoid modifying original
            enhanced_ref = ref.copy()
            
            # Add metadata
            enhanced_ref = self.add_metadata(enhanced_ref)
            
            # If tracker provided, use it for more accurate tracking
            if tracker:
                result = tracker.track_article(
                    code=ref['code'],
                    article=ref['article'],
                    content=ref['content'],
                    title=ref.get('title', ''),
                    source_url=ref.get('sourceUrl', '')
                )
                enhanced_ref['checksum'] = result['checksum']
                enhanced_ref['lastUpdated'] = result['lastUpdated']
                
                # Get history if available
                history = tracker.get_article_history(ref['code'], ref['article'])
                if history:
                    enhanced_ref['firstSeen'] = history.get('firstSeen', enhanced_ref['lastUpdated'])
            
            enhanced_references.append(enhanced_ref)
        
        return enhanced_references
    
    def migrate_existing_references(self, input_file: str, output_file: str) -> Dict:
        """Migrate existing legal references to include metadata."""
        try:
            # Load existing references
            with open(input_file, 'r', encoding='utf-8') as f:
                references_dict = json.load(f)
            
            # Initialize tracker for accurate history
            from content_tracker import ContentTracker
            tracker = ContentTracker()
            
            # Check if it's a dictionary or list
            if isinstance(references_dict, dict):
                # It's a dictionary, convert values to list for processing
                references_list = list(references_dict.values())
                
                # Enhance references with metadata
                enhanced_references_list = self.enhance_legal_references(references_list, tracker)
                
                # Convert back to dictionary format
                enhanced_references = {}
                for ref in enhanced_references_list:
                    key = f"{ref['code']} {ref['article']}"
                    enhanced_references[key] = ref
            else:
                # It's already a list
                enhanced_references = self.enhance_legal_references(references_dict, tracker)
            
            # Save enhanced references
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(enhanced_references, f, ensure_ascii=False, indent=2)
            
            return {
                'success': True,
                'total_references': len(enhanced_references),
                'message': f'Successfully migrated {len(enhanced_references)} references'
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': f'Failed to migrate references: {str(e)}'
            }
    
    def validate_metadata(self, reference: Dict) -> Dict[str, bool]:
        """Validate that a reference has all required metadata fields."""
        required_fields = ['code', 'article', 'content', 'lastUpdated', 'checksum']
        optional_fields = ['title', 'sourceUrl', 'firstSeen']
        
        validation = {
            'valid': True,
            'missing_required': [],
            'missing_optional': []
        }
        
        # Check required fields
        for field in required_fields:
            if field not in reference or not reference[field]:
                validation['valid'] = False
                validation['missing_required'].append(field)
        
        # Check optional fields
        for field in optional_fields:
            if field not in reference:
                validation['missing_optional'].append(field)
        
        return validation
    
    def format_timestamp(self, iso_timestamp: str, locale: str = 'tr-TR') -> str:
        """Format ISO timestamp for display."""
        try:
            dt = datetime.fromisoformat(iso_timestamp.replace('Z', '+00:00'))
            if locale == 'tr-TR':
                return dt.strftime('%d.%m.%Y %H:%M')
            else:
                return dt.strftime('%Y-%m-%d %H:%M')
        except:
            return iso_timestamp
    
    def is_content_old(self, last_updated: str, months: int = 6) -> bool:
        """Check if content is older than specified months."""
        try:
            last_updated_dt = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
            months_ago = datetime.now(last_updated_dt.tzinfo)
            
            # Calculate difference in months
            month_diff = (months_ago.year - last_updated_dt.year) * 12 + months_ago.month - last_updated_dt.month
            
            return month_diff >= months
        except:
            return False
    
    def generate_metadata_report(self, references: List[Dict]) -> str:
        """Generate a report on metadata completeness."""
        report = []
        report.append("Metadata Validation Report")
        report.append("=" * 40)
        
        total = len(references)
        valid_count = 0
        old_content_count = 0
        missing_metadata = {
            'lastUpdated': 0,
            'checksum': 0,
            'sourceUrl': 0,
            'firstSeen': 0
        }
        
        for ref in references:
            validation = self.validate_metadata(ref)
            if validation['valid']:
                valid_count += 1
            
            # Check for old content
            if 'lastUpdated' in ref and self.is_content_old(ref['lastUpdated']):
                old_content_count += 1
            
            # Track missing fields
            for field in missing_metadata:
                if field not in ref:
                    missing_metadata[field] += 1
        
        report.append(f"\nTotal References: {total}")
        report.append(f"Valid References: {valid_count} ({valid_count/total*100:.1f}%)")
        report.append(f"Old Content (>6 months): {old_content_count}")
        
        report.append("\nMissing Metadata Fields:")
        for field, count in missing_metadata.items():
            if count > 0:
                report.append(f"  - {field}: {count} references")
        
        return '\n'.join(report)