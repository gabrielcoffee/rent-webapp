"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import styles from "./page.module.css"
import Image from "next/image"
import { List, MessageCircle } from "lucide-react"

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showMoreFAQ, setShowMoreFAQ] = useState(false)
  const [showToTop, setShowToTop] = useState(false)
  const [showHeroHint, setShowHeroHint] = useState(true)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const revealRefs = useRef<(HTMLElement | null)[]>([])

  // Fade-in animation for featured images
  useEffect(() => {
    imagesRef.current.forEach((img, index) => {
      if (img) {
        setTimeout(
          () => {
            img.classList.add(styles.fadeIn)
          },
          500 + index * 150,
        )
      }
    })
  }, [])

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowToTop(scrollY > 300)
      setShowHeroHint(scrollY <= 300)

      // Reveal on scroll
      const trigger = window.innerHeight * 0.9
      revealRefs.current.forEach((el) => {
        if (el) {
          const top = el.getBoundingClientRect().top
          if (top < trigger) {
            el.classList.add(styles.visible)
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleContactSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nome = formData.get("nome") as string
    const email = formData.get("email") as string
    const mensagem = formData.get("mensagem") as string

    const assunto = encodeURIComponent(`Contato pelo site - ${nome}`)
    const corpo = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\n${mensagem}`)
    window.location.href = `mailto:contato@rent.com?subject=${assunto}&body=${corpo}`
  }

  const toggleFAQ = () => {
    setShowMoreFAQ(!showMoreFAQ)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
                
            <div className={styles.navLinks}>
                <a href="#como-funciona" className={styles.navLink}>
                    Como Funciona
                </a>
                <a href="#por-que-rent" className={styles.navLink}>
                    Por que usar
                </a>
            </div>


            <a
                className={styles.logoButton}
                href="#"
                onClick={(e) => {
                e.preventDefault()
                scrollToTop()
                }}
            >
                <Image width={80} height={80} src="/assets/logo.png" alt="logo Rent" />
            </a>

            <div className={styles.navLinks}>
                <a href="#sobre-nos" className={styles.navLink}>
                    Sobre Nós
                </a>
                <a href="#contato" className={styles.navLink}>
                    Contato
                </a>
            </div>
        </div>

        <div className={styles.headerMobile}>
        <button
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`${styles.navMobile} ${isMobileMenuOpen ? styles.active : ""}`}>
            <a href="#como-funciona" className={styles.navLink} onClick={closeMobileMenu}>
              Como Funciona
            </a>
            <a href="#por-que-rent" className={styles.navLink} onClick={closeMobileMenu}>
              Por que usar
            </a>
            <a href="#sobre-nos" className={styles.navLink} onClick={closeMobileMenu}>
              Sobre Nós
            </a>
            <a href="#contato" className={styles.navLink} onClick={closeMobileMenu}>
              Contato
            </a>
          </nav>
        </div>

        <div className={styles.hero}>
          <span className={styles.heroTitle}>
            Alugue, Ganhe <br /> e Economize
          </span>
          <span className={styles.heroSubtitle}>
            Transforme o que você já tem em <strong>renda extra</strong>. <br />
            Encontre o que precisa <strong>por menos</strong>.
          </span>


            <div className={styles.heroButtonContainer}>
                <a className={styles.heroButton} href="/itens-publicados" rel="noopener noreferrer">
                    <button className={styles.outlineButton}><List size={20} /> Itens disponíveis</button>
                </a>

                <a className={styles.heroButton} href="https://wa.me/5541987865005" target="_blank" rel="noopener noreferrer">
                    <button className={styles.outlineButton}><MessageCircle size={20} /> Converse conosco</button>
                </a>

            </div>

        </div>

        <div className={styles.featuredItems}>
          <Image
            ref={(el) => {
              imagesRef.current[0] = el as any
            }}
            src="/assets/ps5.webp"
            alt="PlayStation 5"
            width={300}
            height={200}
          />
          <Image
            ref={(el) => {
              imagesRef.current[1] = el as any
            }}
            src="/assets/camera.png"
            alt="Câmera"
            width={300}
            height={200}
          />
          <Image
            ref={(el) => {
              imagesRef.current[2] = el as any
            }}
            src="/assets/furadeira.webp"
            alt="Furadeira"
            width={300}
            height={200}
          />
          <Image
            ref={(el) => {
              imagesRef.current[3] = el as any
            }}
            src="/assets/bicicleta.png"
            alt="Bicicleta"
            width={300}
            height={200}
          />
        </div>

        <div className={styles.categoriesBanner} role="region" aria-label="Categorias de itens para alugar">
          <div className={styles.marquee}>
            <div className={styles.marqueeTrack}>
              <span className={styles.bannerItem}>🚲 Bicicletas</span>
              <span className={styles.bannerItem}>📷 Câmeras</span>
              <span className={styles.bannerItem}>🛠️ Ferramentas</span>
              <span className={styles.bannerItem}>🎮 Videogames</span>
              <span className={styles.bannerItem}>🚁 Drones</span>
              <span className={styles.bannerItem}>🎸 Instrumentos</span>
              <span className={styles.bannerItem}>🏕️ Esportivos</span>
              <span className={styles.bannerItem}>🎉 Festas & Eventos</span>
              <span className={styles.bannerItem}>📺 Eletrônicos</span>
              <span className={styles.bannerItem}>🌿 Jardinagem</span>
            </div>
            <div className={styles.marqueeTrack} aria-hidden="true">
              <span className={styles.bannerItem}></span>
              <span className={styles.bannerItem}>🚲 Bicicletas</span>
              <span className={styles.bannerItem}>📷 Câmeras</span>
              <span className={styles.bannerItem}>🛠️ Ferramentas</span>
              <span className={styles.bannerItem}>🎮 Videogames</span>
              <span className={styles.bannerItem}>🚁 Drones</span>
              <span className={styles.bannerItem}>🎸 Instrumentos</span>
              <span className={styles.bannerItem}>🏕️ Esportivos</span>
              <span className={styles.bannerItem}>🎉 Festas & Eventos</span>
              <span className={styles.bannerItem}>📺 Eletrônicos</span>
              <span className={styles.bannerItem}>🌿 Jardinagem</span>
            </div>
          </div>
        </div>

        <section id="como-funciona" className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Passo a passo</span>
            <h2>Como Funciona</h2>
          </div>

          <div
            className={`${styles.stepsGrid} ${styles.reveal}`}
            ref={(el) => {
              revealRefs.current[0] = el
            }}
          >
            <div className={`${styles.stepItem} ${styles.stepHeader}`}>
              <div className={styles.stepIcon}>📦</div>
              <h3>Alugar de Outros</h3>
              <p>Encontre e alugue itens de outras pessoas</p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <h3>BUSQUE</h3>
              <p>Encontre o item ideal por categoria e compare preços!</p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <h3>RESERVE</h3>
              <p>Defina datas, combine entrega e finalize o pagamento!</p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <h3>APROVEITE</h3>
              <p>Aproveite o item e devolva no prazo combinado!</p>
            </div>
          </div>

          <div
            className={`${styles.stepsGrid} ${styles.reveal}`}
            ref={(el) => {
              revealRefs.current[1] = el
            }}
          >
            <div className={`${styles.stepItem} ${styles.stepHeader}`}>
              <div className={styles.stepIcon}>💰</div>
              <h3>Disponibilizar para Outros</h3>
              <p>Ganhe dinheiro com seus itens parados</p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <h3>ANUNCIE</h3>
              <p>Cadastre fotos, descrição e defina o preço do aluguel!</p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <h3>APROVE</h3>
              <p>Aprove pedidos e combine detalhes com os interessados!</p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <h3>RECEBA</h3>
              <p>Entregue o item e receba o pagamento!</p>
            </div>
          </div>
        </section>

        <section
          id="por-que-rent"
          className={`${styles.section} ${styles.reveal}`}
          ref={(el) => {
            revealRefs.current[2] = el
          }}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Vantagens</span>
            <h2>Por que usar a Rent?</h2>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIco}>💸</div>
              <h3>Economia Real</h3>
              <p>
                * Pague apenas pelo tempo de uso! <br />* Esqueça os custos de compra, manutenção ou armazenamento!{" "}
                <br />* Acesse utensílios, ferramentas e equipamentos dos seus vizinhos. <br />* Mais praticidade, menos
                gastos.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIco}>♻️</div>
              <h3>Sustentável</h3>
              <p>
                * Compartilhar entre vizinhos reduz o desperdício e instiga o consumo consciente! <br />* Uma furadeira
                usada por 10 famílias vale mais que 10 guardadas. <br />* Juntos, criamos um condomínio mais sustentável
                e colaborativo! <br />
              </p>
            </div>
          </div>
        </section>

        <section
          id="sobre-nos"
          className={`${styles.section} ${styles.reveal}`}
          ref={(el) => {
            revealRefs.current[3] = el
          }}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Nossa missão</span>
            <h2>Sobre Nós</h2>
          </div>

          <div className={styles.contentWithImage}>
            <div className={styles.textContent}>
              <p>
                Somos uma plataforma que conecta pessoas interessadas em compartilhar recursos de forma simples e
                sustentável. Nossa missão é democratizar o acesso a bens e serviços, permitindo que qualquer pessoa
                possa monetizar itens parados ou encontrar exatamente o que precisa, sem gastar com compras
                desnecessárias.
              </p>
              <p>
                Acreditamos que o futuro da economia é colaborativo. Por isso, criamos um ambiente seguro e confiável
                onde nossa comunidade pode prosperar, gerar renda extra, economizar e ainda contribuir para um mundo
                mais sustentável através do compartilhamento consciente.
              </p>
              <p>
                Surgimos do sonho da geração, uma visão que pretende guiar um futuro melhor para todos. Principalmente,
                com muita responsabilidade, ousamos melhorar a economia e a vida das pessoas.
              </p>
            </div>


            <h2>Equipe Rent</h2>


            <div className={styles.socios}>
              <div className={styles.socioCard}>
                <Image src="/assets/bopp.png" alt="Foto da Equipe Rent" width={120} height={120} />
                <div className={styles.socioNome}>João Bopp</div>
                <div className={styles.socioDesc}>Mestre em Gestão (CEFAM) e bacharel em Administração (FAE), com formação em gestão estratégica e liderança de projetos.</div>
              </div>

              <div className={styles.socioCard}>
                <Image src="/assets/syd.png" alt="Foto da Equipe Rent" width={120} height={120} />
                <div className={styles.socioNome}>Sydnei Netto</div>
                <div className={styles.socioDesc}>Oficial de Intendência do Exército Brasileiro, certificado CPA-20. Com formação em Administração, especialista em gestão financeira e gestão logístico-operacional.</div>
              </div>

              <div className={styles.socioCard}>
                <Image src="/assets/gab.jpeg" alt="Foto da Equipe Rent" width={120} height={120} />
                <div className={styles.socioNome}>Gabriel Fernandes</div>
                <div className={styles.socioDesc}>Bacharel em Engenharia de Software (PUC-PR), desenvolvedor full stack com experiência em arquitetura e soluções escaláveis.</div>
              </div>

              <div className={styles.socioCard}>
                <Image src="/assets/noah.png" alt="Foto da Equipe Rent" width={120} height={120} />
                <div className={styles.socioNome}>Pedro Noah</div>
                <div className={styles.socioDesc}>Bacharel em Engenharia de Software (PUC-PR), cientista de dados especializado em inteligência artificial e modelagem preditiva.</div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className={`${styles.section} ${styles.reveal}`}
          ref={(el) => {
            revealRefs.current[4] = el
          }}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Dúvidas frequentes</span>
            <h2>FAQ</h2>
          </div>
          <div className={styles.faq}>
            <details>
              <summary>Como funciona dentro do condomínio?</summary>
              <p>
                A plataforma conecta moradores do mesmo condomínio para compartilhar itens. Você pode alugar
                ferramentas, equipamentos e outros objetos dos seus vizinhos de forma segura e prática.
              </p>
            </details>
            <details>
              <summary>Como defino o preço do meu item?</summary>
              <p>
                Você pode definir o preço livremente. Sugerimos uma porcentagem do valor de mercado como referência, mas
                o valor final é sempre sua escolha baseada na demanda e condição do item.
              </p>
            </details>
            <details>
              <summary>Preciso conhecer meus vizinhos pessoalmente?</summary>
              <p>
                Não é obrigatório, mas recomendamos. A plataforma facilita o primeiro contato, mas conhecer seus
                vizinhos torna o processo mais confiável e colaborativo.
              </p>
            </details>
            <details>
              <summary>Como é feita a entrega dentro do condomínio?</summary>
              <p>
                A entrega pode ser combinada diretamente entre os moradores: na portaria, no apartamento ou em área
                comum. A proximidade facilita a logística.
              </p>
            </details>

            {showMoreFAQ && (
              <>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>E se meu vizinho danificar meu item?</summary>
                  <p>
                    Ainda não nos responsabilizamos por danos ou imprevistos, porém logo poderemos implementar caução
                    prévia. Por enquanto, incentivamos o diálogo entre vizinhos para resolver questões amigavelmente.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Posso alugar para pessoas de outros condomínios?</summary>
                  <p>
                    Inicialmente, focamos apenas em conexões dentro do mesmo condomínio para garantir segurança e
                    praticidade. Futuramente, expandiremos para um público geral.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Como é feito o pagamento?</summary>
                  <p>
                    O pagamento é feito diretamente com o outro morador. Futuramente será através da plataforma, mas
                    esta é uma versão inicial mais simplificada.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Que tipos de itens posso alugar?</summary>
                  <p>
                    Ferramentas, equipamentos domésticos, itens de festa, esportivos, eletrônicos, audiovisuais,
                    jardinagem e muito mais. Praticamente qualquer item útil que você tenha parado pode gerar renda.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Existe verificação dos moradores?</summary>
                  <p>
                    Sim, verificamos que o usuário realmente mora no condomínio através de documentos e confirmação com
                    a administração predial.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Posso recusar um pedido de aluguel?</summary>
                  <p>
                    Sim, você tem total controle sobre quando e para quem emprestar seus itens. Pode definir
                    disponibilidade e escolher os inquilinos.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>E se eu precisar do meu item enquanto está alugado?</summary>
                  <p>
                    Recomendamos verificar sua agenda antes de disponibilizar. Em emergências, dialogue com seu vizinho
                    - a proximidade facilita renegociações.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Como garanto que vou receber meu item de volta?</summary>
                  <p>
                    O fato de serem vizinhos aumenta a responsabilidade e facilita a cobrança. Além disso, futuramente
                    poderemos implementar depósito de caução quando necessário.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Posso cancelar um aluguel?</summary>
                  <p>
                    Sim, pode cancelar a qualquer momento sem gerar taxas no momento, por ser uma versão inicial. Porém
                    recomendamos que seja avisado pelo menos 24h antes para não gerar conflitos.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>A administração do condomínio precisa autorizar?</summary>
                  <p>
                    Não é necessária autorização específica, mas mantemos boa relação com administrações e seguimos as
                    regras internas de cada condomínio.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Como defino por quanto tempo posso emprestar?</summary>
                  <p>
                    Você define livremente: algumas horas, dias ou semanas. Pode ter itens para aluguel rápido
                    (furadeira por 2h) ou mais longo (bicicleta por uma semana).
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>Preciso pagar imposto sobre a renda dos aluguéis?</summary>
                  <p>
                    Recomendamos consultar um contador, mas geralmente rendas pequenas entre vizinhos podem ser isentas.
                    Fornecemos relatórios para facilitar sua declaração.
                  </p>
                </details>
                <details className={`${styles.faqHidden} ${styles.show}`}>
                  <summary>O que acontece se a devolução atrasar?</summary>
                  <p>
                    Como são vizinhos, recomendamos diálogo direto para resolver atrasos. Futuramente implementaremos
                    multas automáticas, mas por ora incentivamos a comunicação e bom senso entre moradores.
                  </p>
                </details>
              </>
            )}

            <div className={styles.faqToggleContainer}>
              <button className={styles.faqToggleBtn} onClick={toggleFAQ}>
                {showMoreFAQ ? "Mostrar menos perguntas ↑" : "Mostrar mais perguntas ↓"}
              </button>
            </div>
          </div>
        </section>

        <section
          id="contato"
          className={`${styles.section} ${styles.reveal}`}
          ref={(el) => {
            revealRefs.current[5] = el
          }}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Fale com a gente</span>
            <h2>Contato</h2>
          </div>

          <div className={styles.contactFlex}>
            <div className={styles.contactCard}>
              <h3>Atendimento</h3>
              <p>
                Email: <a className={styles.contactLink} href="mailto:rent.brasil.contato@gmail.com">rent.brasil.contato@gmail.com</a>
              </p>
              <p>
                WhatsApp:{" "}
                <a className={styles.contactLink} href="https://wa.me/5541987865005" target="_blank" rel="noopener noreferrer">
                  (41) 98786-5005
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.footer}>
        <div className={styles.categoriesBanner} role="region" aria-label="Categorias de itens para alugar">
          <div className={styles.marquee}>
            <div className={styles.marqueeTrack}>
              <span className={styles.bannerItem}>🚲 Bicicletas</span>
              <span className={styles.bannerItem}>📷 Câmeras</span>
              <span className={styles.bannerItem}>🛠️ Ferramentas</span>
              <span className={styles.bannerItem}>🎮 Videogames</span>
              <span className={styles.bannerItem}>🚁 Drones</span>
              <span className={styles.bannerItem}>🎸 Instrumentos</span>
              <span className={styles.bannerItem}>🏕️ Esportivos</span>
              <span className={styles.bannerItem}>🎉 Festas & Eventos</span>
              <span className={styles.bannerItem}>📺 Eletrônicos</span>
              <span className={styles.bannerItem}>🌿 Jardinagem</span>
            </div>
            <div className={styles.marqueeTrack} aria-hidden="true">
              <span className={styles.bannerItem}></span>
              <span className={styles.bannerItem}>🚲 Bicicletas</span>
              <span className={styles.bannerItem}>📷 Câmeras</span>
              <span className={styles.bannerItem}>🛠️ Ferramentas</span>
              <span className={styles.bannerItem}>🎮 Videogames</span>
              <span className={styles.bannerItem}>🚁 Drones</span>
              <span className={styles.bannerItem}>🎸 Instrumentos</span>
              <span className={styles.bannerItem}>🏕️ Esportivos</span>
              <span className={styles.bannerItem}>🎉 Festas & Eventos</span>
              <span className={styles.bannerItem}>📺 Eletrônicos</span>
              <span className={styles.bannerItem}>🌿 Jardinagem</span>
            </div>
          </div>
        </div>

        <div className={styles.footerContent}>
          <div className={styles.footerMain}>
            <div className={styles.footerLeft}>
              <a
                className={styles.footerLogo}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToTop()
                }}
              >
                <Image width={60} height={60} src="/assets/logo.png" alt="logo Rent" />
              </a>
              <nav className={styles.footerNav}>
                <a href="#como-funciona" className={styles.footerNavLink}>
                  Como Funciona
                </a>
                <a href="#por-que-rent" className={styles.footerNavLink}>
                  Por que usar
                </a>
                <a href="#sobre-nos" className={styles.footerNavLink}>
                  Sobre Nós
                </a>
                <a href="#contato" className={styles.footerNavLink}>
                  Contato
                </a>
              </nav>
            </div>

            <div className={styles.footerRight}>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className={styles.socialLink} aria-label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className={styles.footerBrand}>
            <h1 className={styles.brandName}>RentBrasil</h1>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.copyright}>2025 © RentBrasil</div>
            <div className={styles.licenses}>Licenses</div>
          </div>
        </div>
      </div>
    </>
  )
}
