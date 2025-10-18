<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\News;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');
        $this->command->newLine();

        // Create Super Admin
        $superAdmin = User::create([
            'name' => 'Administrador Geral',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'is_super_admin' => true,
        ]);

        $this->command->info('✅ Super Admin created: admin@example.com / password');

        // Create Tenants with Portuguese names
        $tenantGlobo = Tenant::create([
            'name' => 'Portal Globo News',
            'domain' => 'globonews.com.br',
        ]);

        $this->command->info('✅ Tenant created: Portal Globo News');

        $tenantFolha = Tenant::create([
            'name' => 'Folha de São Paulo',
            'domain' => 'folha.uol.com.br',
        ]);

        $this->command->info('✅ Tenant created: Folha de São Paulo');

        $tenantEstadao = Tenant::create([
            'name' => 'Estadão Digital',
            'domain' => 'estadao.com.br',
        ]);

        $this->command->info('✅ Tenant created: Estadão Digital');

        // Create users for Portal Globo News
        $userGlobo1 = User::create([
            'name' => 'Carlos Silva',
            'email' => 'carlos.silva@globonews.com.br',
            'password' => Hash::make('password'),
        ]);
        $userGlobo1->tenants()->attach($tenantGlobo->id, ['role' => 'admin']);

        $userGlobo2 = User::create([
            'name' => 'Maria Santos',
            'email' => 'maria.santos@globonews.com.br',
            'password' => Hash::make('password'),
        ]);
        $userGlobo2->tenants()->attach($tenantGlobo->id, ['role' => 'editor']);

        $this->command->info('✅ Users created for Portal Globo News');

        // Create users for Folha de São Paulo
        $userFolha1 = User::create([
            'name' => 'João Oliveira',
            'email' => 'joao.oliveira@folha.com.br',
            'password' => Hash::make('password'),
        ]);
        $userFolha1->tenants()->attach($tenantFolha->id, ['role' => 'admin']);

        $userFolha2 = User::create([
            'name' => 'Ana Costa',
            'email' => 'ana.costa@folha.com.br',
            'password' => Hash::make('password'),
        ]);
        $userFolha2->tenants()->attach($tenantFolha->id, ['role' => 'editor']);

        $this->command->info('✅ Users created for Folha de São Paulo');

        // Create users for Estadão Digital
        $userEstadao1 = User::create([
            'name' => 'Pedro Almeida',
            'email' => 'pedro.almeida@estadao.com.br',
            'password' => Hash::make('password'),
        ]);
        $userEstadao1->tenants()->attach($tenantEstadao->id, ['role' => 'admin']);

        $userEstadao2 = User::create([
            'name' => 'Juliana Ferreira',
            'email' => 'juliana.ferreira@estadao.com.br',
            'password' => Hash::make('password'),
        ]);
        $userEstadao2->tenants()->attach($tenantEstadao->id, ['role' => 'editor']);

        $this->command->info('✅ Users created for Estadão Digital');

        $this->command->newLine();
        $this->command->info('📰 Creating news articles in Portuguese...');
        $this->command->newLine();

        // Create Portuguese news for Portal Globo News
        $newsGlobo = [
            [
                'title' => 'Economia brasileira cresce 3,2% no último trimestre',
                'content' => 'A economia brasileira apresentou crescimento de 3,2% no último trimestre, superando as expectativas do mercado. O resultado foi impulsionado principalmente pelo setor de serviços, que registrou alta de 4,1% no período. Analistas apontam que a retomada do consumo das famílias e os investimentos em infraestrutura foram determinantes para o desempenho positivo.',
            ],
            [
                'title' => 'Tecnologia 5G chega a mais 50 cidades brasileiras',
                'content' => 'A tecnologia 5G está se expandindo rapidamente pelo Brasil, chegando a mais 50 cidades neste mês. A nova geração de internet móvel promete velocidades até 100 vezes superiores ao 4G, revolucionando setores como saúde, educação e indústria. Especialistas estimam que até o final do ano, mais de 200 cidades terão cobertura 5G.',
            ],
            [
                'title' => 'Sustentabilidade: Brasil lidera produção de energia renovável na América Latina',
                'content' => 'O Brasil consolidou sua posição como líder em energia renovável na América Latina, com 85% de sua matriz elétrica proveniente de fontes limpas. O país se destaca na produção de energia hidrelétrica, solar e eólica. Investimentos em parques eólicos no Nordeste têm atraído bilhões em capital estrangeiro.',
            ],
            [
                'title' => 'Educação: Novo programa de bolsas beneficia 100 mil estudantes',
                'content' => 'O governo federal lançou um novo programa de bolsas de estudo que beneficiará 100 mil estudantes de baixa renda em universidades públicas e privadas. A iniciativa visa ampliar o acesso ao ensino superior e reduzir as desigualdades educacionais. As inscrições estarão abertas a partir da próxima semana.',
            ],
            [
                'title' => 'Inovação: Startup brasileira desenvolve solução para mobilidade urbana',
                'content' => 'Uma startup brasileira desenvolveu uma plataforma inovadora de mobilidade urbana que integra diversos modais de transporte em um único aplicativo. A solução já está operando em São Paulo e Rio de Janeiro, com planos de expansão para outras capitais. A tecnologia utiliza inteligência artificial para otimizar rotas e reduzir o tempo de deslocamento.',
            ],
        ];

        foreach ($newsGlobo as $newsData) {
            News::create([
                'title' => $newsData['title'],
                'content' => $newsData['content'],
                'tenant_id' => $tenantGlobo->id,
                'author_id' => $userGlobo1->id,
            ]);
        }

        $this->command->info('✅ 5 news created for Portal Globo News');

        // Create Portuguese news for Folha de São Paulo
        $newsFolha = [
            [
                'title' => 'Mercado imobiliário registra aquecimento em grandes capitais',
                'content' => 'O mercado imobiliário brasileiro apresentou forte aquecimento nas grandes capitais, com aumento de 15% nas vendas de imóveis novos. São Paulo e Rio de Janeiro lideram o crescimento, impulsionados por taxas de juros mais atrativas e programas habitacionais. Construtoras reportam aumento na procura por imóveis de médio e alto padrão.',
            ],
            [
                'title' => 'Cultura: Festival de cinema brasileiro atrai público recorde',
                'content' => 'O Festival Internacional de Cinema do Brasil encerrou sua 45ª edição com público recorde de 200 mil espectadores. O evento exibiu mais de 300 filmes de 50 países, com destaque para produções nacionais que conquistaram prêmios internacionais. A próxima edição promete ser ainda maior, com novos espaços de exibição.',
            ],
            [
                'title' => 'Saúde: Nova vacina contra dengue mostra eficácia de 90%',
                'content' => 'Pesquisadores brasileiros desenvolveram uma nova vacina contra a dengue que apresentou eficácia de 90% em testes clínicos. O imunizante, desenvolvido em parceria com instituições internacionais, deve estar disponível no SUS em 2026. A descoberta é celebrada como um marco na luta contra doenças tropicais.',
            ],
            [
                'title' => 'Turismo: Brasil recebe 2 milhões de turistas estrangeiros em um mês',
                'content' => 'O turismo brasileiro registrou entrada recorde de 2 milhões de visitantes estrangeiros em um único mês, superando os números pré-pandemia. Destinos como Rio de Janeiro, Foz do Iguaçu e Salvador foram os mais procurados. O setor projeta crescimento de 20% na receita anual, gerando milhares de empregos.',
            ],
            [
                'title' => 'Agronegócio: Safra de grãos deve bater recorde histórico',
                'content' => 'A safra brasileira de grãos deve atingir recorde histórico de 320 milhões de toneladas, segundo estimativas da Conab. O resultado é atribuído a condições climáticas favoráveis e investimentos em tecnologia agrícola. O Brasil consolida sua posição como um dos maiores exportadores mundiais de commodities agrícolas.',
            ],
        ];

        foreach ($newsFolha as $newsData) {
            News::create([
                'title' => $newsData['title'],
                'content' => $newsData['content'],
                'tenant_id' => $tenantFolha->id,
                'author_id' => $userFolha1->id,
            ]);
        }

        $this->command->info('✅ 5 news created for Folha de São Paulo');

        // Create Portuguese news for Estadão Digital
        $newsEstadao = [
            [
                'title' => 'Inteligência Artificial transforma setor de atendimento ao cliente',
                'content' => 'Empresas brasileiras estão investindo massivamente em inteligência artificial para transformar o atendimento ao cliente. Chatbots avançados e assistentes virtuais já atendem milhões de usuários diariamente, com taxa de resolução de 80% dos casos. A tecnologia promete reduzir custos e melhorar a experiência do consumidor.',
            ],
            [
                'title' => 'Mobilidade elétrica: Vendas de carros elétricos crescem 150% no país',
                'content' => 'As vendas de veículos elétricos no Brasil cresceram 150% no último ano, impulsionadas por incentivos fiscais e preocupação ambiental. Montadoras anunciaram investimentos bilionários para produção local de carros elétricos. A expansão da rede de recarga é apontada como desafio para o setor.',
            ],
            [
                'title' => 'Cibersegurança: Empresas brasileiras investem R$ 20 bilhões em proteção',
                'content' => 'Empresas brasileiras devem investir R$ 20 bilhões em cibersegurança este ano, um aumento de 25% em relação a 2024. O crescimento dos ataques cibernéticos e a Lei Geral de Proteção de Dados impulsionam os investimentos. Especialistas alertam para a necessidade de capacitação de profissionais na área.',
            ],
            [
                'title' => 'Esportes: Brasil conquista 5 medalhas de ouro em campeonato mundial',
                'content' => 'A delegação brasileira conquistou 5 medalhas de ouro no Campeonato Mundial de Atletismo, superando as expectativas. Os atletas brasileiros se destacaram em provas de velocidade e saltos, estabelecendo novos recordes sul-americanos. O resultado coloca o país entre os 10 melhores do ranking mundial.',
            ],
            [
                'title' => 'Ciência: Pesquisadores brasileiros descobrem nova espécie na Amazônia',
                'content' => 'Cientistas brasileiros descobriram uma nova espécie de primata na Amazônia, reforçando a importância da preservação da floresta. O animal, batizado cientificamente, habita uma região remota e apresenta características únicas. A descoberta foi publicada em revista científica internacional de prestígio.',
            ],
        ];

        foreach ($newsEstadao as $newsData) {
            News::create([
                'title' => $newsData['title'],
                'content' => $newsData['content'],
                'tenant_id' => $tenantEstadao->id,
                'author_id' => $userEstadao1->id,
            ]);
        }

        $this->command->info('✅ 5 news created for Estadão Digital');

        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info('🎉 Seeding completed successfully!');
        $this->command->info('========================================');
        $this->command->newLine();
        $this->command->info('👤 Credentials:');
        $this->command->info('Super Admin: admin@example.com / password');
        $this->command->newLine();
        $this->command->info('Portal Globo News:');
        $this->command->info('  Admin: carlos.silva@globonews.com.br / password');
        $this->command->info('  Editor: maria.santos@globonews.com.br / password');
        $this->command->newLine();
        $this->command->info('Folha de São Paulo:');
        $this->command->info('  Admin: joao.oliveira@folha.com.br / password');
        $this->command->info('  Editor: ana.costa@folha.com.br / password');
        $this->command->newLine();
        $this->command->info('Estadão Digital:');
        $this->command->info('  Admin: pedro.almeida@estadao.com.br / password');
        $this->command->info('  Editor: juliana.ferreira@estadao.com.br / password');
        $this->command->info('========================================');
    }
}
