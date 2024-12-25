import { Category } from '../types';

export const checklistData: Category[] = [
  {
    id: '1',
    name: 'I. Kolluk birimine gitmeden önce yapmanız gereken hazırlık',
    items: [
      {
        id: '1.1',
        category: 'I. Kolluk birimine gitmeden önce yapmanız gereken hazırlık',
        question: 'Şüpheliye isnat edilen suç nedir?',
        type: 'text'
      },
      {
        id: '1.2',
        category: 'I. Kolluk birimine gitmeden önce yapmanız gereken hazırlık',
        question: 'Şüpheliye yüklenen suçun şikayete bağlı olup olmadığını (TCK 73), önödeme (TCK 75), uzlaştırma (CMK 253), kamu davasının açılmasının ertelenmesi (CMK 171/2), seri muhakeme usulü (CMK 250) veya etkin pişmanlığa tabi olup olmadığını araştırdınız mı?',
        type: 'yesNo'
      },
      {
        id: '1.3',
        category: 'I. Kolluk birimine gitmeden önce yapmanız gereken hazırlık',
        question: 'Sizinle irtibata geçen kimseden bu suçla ilgili olarak ham bilgi aldınız mı?',
        type: 'yesNo'
      }
    ]
  },
  {
    id: '2',
    name: 'II. Aramanın Hukuka Uygunluğunun Denetlenmesi',
    items: [
      {
        id: '2.1',
        category: 'II. Aramanın Hukuka Uygunluğunun Denetlenmesi',
        question: 'Olayın işlendiği yer kamuya açık bir yer mi, yoksa özel mülkiyete ait bir alan mıdır, tespit ettiniz mi?',
        type: 'yesNo'
      },
      {
        id: '2.2',
        category: 'II. Aramanın Hukuka Uygunluğunun Denetlenmesi',
        question: 'Özel bir mülkiyete tabi ise, hakimden arama kararı veya Cumhuriyet savcısından arama emri alınmış mıdır? (CMK 119/1)',
        type: 'yesNo'
      },
      {
        id: '2.3',
        category: 'II. Aramanın Hukuka Uygunluğunun Denetlenmesi',
        question: 'Arama kararı alınmadan önce kolluk tarafından makul şüpheyi destekleyen "olgu" elde edilerek, bu olgu hakime sunulmuş mudur?',
        type: 'yesNo'
      },
      {
        id: '2.4',
        category: 'II. Aramanın Hukuka Uygunluğunun Denetlenmesi',
        question: 'Arama kararında; aramanın nedenini oluşturan fiil (makul şüphe), aranılacak kişi veya eşya, aramanın yapılacağı adres, arama kararının geçerli olduğu zaman süresi açıkça yazılmış mıdır?',
        type: 'yesNo'
      },
      {
        id: '2.5',
        category: 'II. Aramanın Hukuka Uygunluğunun Denetlenmesi',
        question: 'Somut olayda alınan arama kararı önleme araması kararı (PVSK 9) olup, adli arama için kullanılmış ise hukuka aykırı delil elde edildiği konusunda Cumhuriyet savcısına duyuru yaptınız mı?',
        type: 'yesNo'
      },
      {
        id: '2.6',
        category: 'II. Aramanın Hukuka Uygunluğunun Denetlenmesi',
        question: 'Arama sırasında Cumhuriyet savcısı hazır bulunmuş mudur?',
        type: 'yesNo'
      },
      {
        id: '2.7',
        category: 'II. Aramanın Hukuka Uygunluğunun Denetlenmesi',
        question: 'Cevap hayır ise, ihtiyar heyetinden veya komşudan iki kişi hazır bulundurulmuş mudur?',
        type: 'yesNo'
      }
    ]
  },
  {
    id: '3',
    name: 'III. Yakalama ve Gözaltı İşlemlerinin Denetlenmesi',
    items: [
      {
        id: '3.1',
        category: 'III. Yakalama ve Gözaltı İşlemlerinin Denetlenmesi',
        question: 'Yakalama işlemi, suçüstü haline mi yapılmıştır? (CMK 90/1)',
        type: 'yesNo'
      },
      {
        id: '3.2',
        category: 'III. Yakalama ve Gözaltı İşlemlerinin Denetlenmesi',
        question: 'Tutuklama kararı vermenin koşulları oluştuğu için kolluk tarafından yakalama resen mi yapılmıştır? (CMK 90/2)',
        type: 'yesNo'
      },
      {
        id: '3.3',
        category: 'III. Yakalama ve Gözaltı İşlemlerinin Denetlenmesi',
        question: 'Cevabınız evet ise, yakalama yetkisinin doğabilmesi için "somut delil" var mıdır? Delil varsa, nedir?',
        type: 'text'
      }
    ]
  },
  {
    id: '4',
    name: 'IV. Dosyanın İncelenmesi ve Şüpheli ile Görüşme',
    items: [
      {
        id: '4.1',
        category: 'IV. Dosyanın İncelenmesi ve Şüpheli ile Görüşme',
        question: 'Soruşturma dosyasını şüpheli ile görüşmeden önce incelediniz mi? (CMK 153/1)',
        type: 'yesNo'
      },
      {
        id: '4.2',
        category: 'IV. Dosyanın İncelenmesi ve Şüpheli ile Görüşme',
        question: 'Soruşturma dosyasından fiziki delil elde edilmiş olduğu anlaşılıyor mu?',
        type: 'yesNo'
      },
      {
        id: '4.3',
        category: 'IV. Dosyanın İncelenmesi ve Şüpheli ile Görüşme',
        question: 'Kolluk tarafından mağdur veya tanık ifadesi alınmış mı?',
        type: 'yesNo'
      }
    ]
  },
  {
    id: '5',
    name: 'V. İfade Alma',
    items: [
      {
        id: '5.1',
        category: 'V. İfade Alma',
        question: 'İfade alma saat kaçta başladı? İfade alma saat kaçta sona erdi?',
        type: 'text'
      },
      {
        id: '5.2',
        category: 'V. İfade Alma',
        question: 'Ses ve görüntü kaydı yapıldı mı?',
        type: 'yesNo'
      },
      {
        id: '5.3',
        category: 'V. İfade Alma',
        question: 'Şüphelinin ifade verecek durumda olmadığını belirlemiş iseniz, bunu ifadeyi alacak olan kolluk görevlisine bildirdiniz mi?',
        type: 'yesNo'
      }
    ]
  },
  {
    id: '6',
    name: 'VI. Seri Muhakeme ve Basit Yargılama Usulleri',
    items: [
      {
        id: '6.1',
        category: 'VI. Seri Muhakeme ve Basit Yargılama Usulleri',
        question: 'Cumhuriyet Savcısı veya kolluk görevlileri şüpheliyi seri muhakeme usulü (CMK 250) hakkında bilgilendirmiş mi?',
        type: 'yesNo'
      },
      {
        id: '6.2',
        category: 'VI. Seri Muhakeme ve Basit Yargılama Usulleri',
        question: 'Seri Muhakeme Usulü hakkında şüpheliyi müdafi olarak siz bilgilendirdiniz mi?',
        type: 'yesNo'
      },
      {
        id: '6.3',
        category: 'VI. Seri Muhakeme ve Basit Yargılama Usulleri',
        question: 'Şüpheliye yüklenen suçun CMK 250/1 maddede sayılan suçlardan biri olup olmadığını kontrol ettiniz mi?',
        type: 'yesNo'
      }
    ]
  }
]; 