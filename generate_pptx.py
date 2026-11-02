import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 4:3 ratio: 10 x 7.5 inches (matches Kongu Engineering College template)
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors matching the template
    C_GREEN = RGBColor(140, 198, 140)       # Soft light green
    C_DARK_GREEN = RGBColor(70, 140, 70)    # Deep green
    C_NAVY = RGBColor(0, 32, 128)           # Dark Navy Blue for Title
    C_TEXT = RGBColor(20, 20, 20)           # Primary Text
    C_KEC_TEXT = RGBColor(128, 0, 96)       # Purple/Maroon for vertical KEC text
    C_WHITE = RGBColor(255, 255, 255)

    def add_slide_background(slide, is_title=False):
        # White background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(10), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_WHITE
        bg.line.fill.background()

        if is_title:
            # Title slide top curved accent
            top_bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.2), Inches(0.1), Inches(9.6), Inches(0.6))
            top_bar.fill.solid()
            top_bar.fill.fore_color.rgb = RGBColor(230, 245, 230)
            top_bar.line.fill.background()
            
            # Left vertical green pillar
            left_p = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.1), Inches(0.8), Inches(0.7), Inches(6.5))
            left_p.fill.solid()
            left_p.fill.fore_color.rgb = C_GREEN
            left_p.line.fill.background()

            # Right vertical green pillar
            right_p = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(9.2), Inches(0.8), Inches(0.7), Inches(6.5))
            right_p.fill.solid()
            right_p.fill.fore_color.rgb = C_GREEN
            right_p.line.fill.background()
        else:
            # Content slide left green pillar
            left_pillar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.08), Inches(0.15), Inches(0.65), Inches(7.2))
            left_pillar.fill.solid()
            left_pillar.fill.fore_color.rgb = C_GREEN
            left_pillar.line.fill.background()

            # Vertical text on the pillar
            tx = left_pillar.text_frame
            tx.word_wrap = False
            tx.vertical_anchor = MSO_ANCHOR.MIDDLE
            p = tx.paragraphs[0]
            p.text = "KONGU ENGINEERING COLLEGE"
            p.font.size = Pt(16)
            p.font.bold = True
            p.font.color.rgb = C_KEC_TEXT
            left_pillar.rotation = 270

    def add_title(slide, title_text):
        tb = slide.shapes.add_textbox(Inches(1.0), Inches(0.4), Inches(8.5), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = "Arial"
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = RGBColor(0, 0, 0)
        p.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    add_slide_background(s1, is_title=True)

    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(8.0), Inches(6.0))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "KONGU ENGINEERING COLLEGE"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = RGBColor(0, 110, 180)
    p.alignment = PP_ALIGN.CENTER

    p2 = tf1.add_paragraph()
    p2.text = "— TRANSFORM YOURSELF —\nDepartment of Computer Science and Engineering"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(60, 60, 60)
    p2.alignment = PP_ALIGN.CENTER

    p3 = tf1.add_paragraph()
    p3.text = "\n24GEP31-Mini Project-I"
    p3.font.size = Pt(20)
    p3.font.bold = True
    p3.font.color.rgb = RGBColor(70, 50, 140)
    p3.alignment = PP_ALIGN.CENTER

    p4 = tf1.add_paragraph()
    p4.text = "REVIEW–2\nBATCH NO: A13\n"
    p4.font.size = Pt(18)
    p4.font.bold = True
    p4.font.color.rgb = RGBColor(180, 20, 20)
    p4.alignment = PP_ALIGN.CENTER

    p5 = tf1.add_paragraph()
    p5.text = "INTELLIGENT AIRPORT BAGGAGE HANDLING AND\nROUTING SYSTEM\n"
    p5.font.size = Pt(20)
    p5.font.bold = True
    p5.font.color.rgb = C_NAVY
    p5.alignment = PP_ALIGN.CENTER

    p6 = tf1.add_paragraph()
    p6.text = "Project by\nAthish M & Team\n"
    p6.font.size = Pt(13)
    p6.font.bold = True
    p6.font.color.rgb = RGBColor(50, 50, 80)
    p6.alignment = PP_ALIGN.CENTER

    p7 = tf1.add_paragraph()
    p7.text = "Guided by\nFaculty Guide, Assistant Professor,\nDepartment of CSE,\nKongu Engineering College"
    p7.font.size = Pt(12)
    p7.font.bold = True
    p7.font.color.rgb = RGBColor(70, 30, 90)
    p7.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 2: PROJECT AREA UNDER SDG
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_background(s2)
    add_title(s2, "PROJECT AREA UNDER SDG")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    sdg_items = [
        (
            "1.SDG 9 – Industry, Innovation and Infrastructure",
            "• Modern web technology, automated conveyor networks, and Dijkstra shortest-path routing optimization.",
            os.path.join(base_dir, "sdg9.png"),
            RGBColor(253, 105, 37)
        ),
        (
            "2.SDG 11 – Sustainable Cities and Communities",
            "• Resilient airport transit infrastructure, minimizing flight turnaround delays and ground logistics congestion.",
            os.path.join(base_dir, "sdg11.png"),
            RGBColor(253, 157, 36)
        ),
        (
            "3.SDG 12 – Responsible Consumption and Production",
            "• Energy-efficient automated conveyor control, resource reuse, and prevention of lost or misplaced luggage.",
            os.path.join(base_dir, "sdg12.png"),
            RGBColor(191, 139, 26)
        )
    ]

    for idx, (title_text, desc_text, img_path, fallback_col) in enumerate(sdg_items):
        y_pos = Inches(1.7 + idx * 1.8)

        # Left text block
        tb = s2.shapes.add_textbox(Inches(1.2), y_pos, Inches(6.1), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0)
        tf.margin_top = Inches(0.1)
        tf.margin_right = Inches(0)
        tf.margin_bottom = Inches(0)

        p1 = tf.paragraphs[0]
        p1.text = title_text
        p1.font.name = "Arial"
        p1.font.size = Pt(18)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT

        p2 = tf.add_paragraph()
        p2.text = desc_text
        p2.font.name = "Arial"
        p2.font.size = Pt(13)
        p2.font.color.rgb = RGBColor(70, 70, 70)
        p2.space_before = Pt(6)

        # Right SDG Official Square Logo
        if os.path.exists(img_path):
            s2.shapes.add_picture(img_path, Inches(7.6), y_pos, Inches(1.5), Inches(1.5))
        else:
            box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.6), y_pos, Inches(1.5), Inches(1.5))
            box.fill.solid()
            box.fill.fore_color.rgb = fallback_col
            box.line.fill.background()
            btf = box.text_frame
            btf.vertical_anchor = MSO_ANCHOR.MIDDLE
            bp = btf.paragraphs[0]
            bp.text = f"SDG {9 if idx==0 else 11 if idx==1 else 12}"
            bp.font.size = Pt(14)
            bp.font.bold = True
            bp.font.color.rgb = C_WHITE
            bp.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 3: PROJECT AREA
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_background(s3)
    add_title(s3, "PROJECT AREA")

    tb = s3.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(8.0), Inches(5.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "The project focuses on using web technology to simplify airport baggage handling and conveyor logistics management.\n"
    p.font.size = Pt(18)
    p.font.color.rgb = C_TEXT

    bullets = [
        ("Web Application: ", "User-friendly interface for managing baggage operations and flight schedules."),
        ("Database Management: ", "Organized storage and retrieval of baggage, flight, and conveyor network information."),
        ("Baggage-to-Aircraft Linkage: ", "Connects terminal check-in desks, security screening stations, and aircraft loading bays.")
    ]
    for head, tail in bullets:
        p = tf.add_paragraph()
        p.text = "●  " + head
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_TEXT

        run = p.add_run()
        run.text = tail + "\n"
        run.font.bold = False

    # ==========================================
    # SLIDE 4: PROBLEM DEFINITION & SCOPE
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_background(s4)
    add_title(s4, "PROBLEM DEFINITION & SCOPE")

    tb = s4.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(8.0), Inches(5.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "PROBLEM STATEMENT"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_TEXT

    p2 = tf.add_paragraph()
    p2.text = "Manual baggage tracking and unexpected conveyor jams can delay aircraft departures and increase mishandled luggage. A centralized web application helps route, prioritize, and monitor airport baggage logistics efficiently.\n"
    p2.font.size = Pt(15)
    p2.font.color.rgb = RGBColor(50, 50, 50)

    p3 = tf.add_paragraph()
    p3.text = "TARGET USERS / STAKEHOLDERS"
    p3.font.size = Pt(17)
    p3.font.bold = True
    p3.font.color.rgb = C_TEXT

    stakeholders = [
        "Baggage Operations Staff",
        "Check-In Counter Agents",
        "Aviation Security & Screening Officers",
        "Apron & Loading Bay Supervisors",
        "Traveling Airline Passengers"
    ]
    for s in stakeholders:
        sp = tf.add_paragraph()
        sp.text = f"❏  {s}"
        sp.font.size = Pt(15)
        sp.font.color.rgb = RGBColor(40, 40, 40)

    # ==========================================
    # SLIDE 5: OBJECTIVES & EXPECTED OUTCOMES
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_background(s5)
    add_title(s5, "OBJECTIVES & EXPECTED OUTCOMES")

    tb = s5.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(8.2), Inches(5.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "OBJECTIVES"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_TEXT

    objs = [
        "1. To develop a user-friendly frontend for managing airport baggage routing and flight schedules.",
        "2. To manage baggage, flight, conveyor node, and loading bay information efficiently.",
        "3. To connect the application with a database for organized data storage and retrieval.",
        "4. To optimize baggage conveyor routing using Dijkstra's shortest-path algorithm and support live passenger tracking."
    ]
    for o in objs:
        op = tf.add_paragraph()
        op.text = o
        op.font.size = Pt(14)
        op.font.color.rgb = RGBColor(40, 40, 40)

    p_out = tf.add_paragraph()
    p_out.text = "\nEXPECTED OUTCOMES"
    p_out.font.size = Pt(17)
    p_out.font.bold = True
    p_out.font.color.rgb = C_TEXT

    p_out_desc = tf.add_paragraph()
    p_out_desc.text = "The system aims to reduce baggage transfer delays, prevent missed loading cutoffs, and make optimal use of conveyor infrastructure. It also ensures that passenger luggage reaches the assigned aircraft on time."
    p_out_desc.font.size = Pt(14)
    p_out_desc.font.color.rgb = RGBColor(40, 40, 40)

    # ==========================================
    # SLIDE 6: TECHNICAL APPROACH & FEASIBILITY
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_background(s6)
    add_title(s6, "TECHNICAL APPROACH & FEASIBILITY")

    tb = s6.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(8.0), Inches(5.5))
    tf = tb.text_frame
    tf.word_wrap = True

    sections = [
        ("FRONTEND", [
            "React, TypeScript, and CSS",
            "Interactive and user-friendly web interface",
            "SVG for conveyor network visualization and QR code tracking"
        ]),
        ("BACKEND", [
            "Java & Spring Boot for application development",
            "Business logic and 4-tier priority queue data processing",
            "Dijkstra's algorithm for shortest-path calculation"
        ]),
        ("DATABASE", [
            "H2 / PostgreSQL for structured relational data storage",
            "Spring Data JPA & Hibernate for database connectivity",
            "Data insertion, retrieval, and updating"
        ])
    ]

    for idx, (title, items) in enumerate(sections):
        p = tf.add_paragraph() if idx > 0 else tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_TEXT

        for it in items:
            p_it = tf.add_paragraph()
            p_it.text = f"●  {it}"
            p_it.font.size = Pt(14)
            p_it.font.color.rgb = RGBColor(50, 50, 50)
        
        if idx < len(sections) - 1:
            p_it.text += ""

    # ==========================================
    # SLIDE 7: SYSTEM ARCHITECTURE / METHODOLOGY
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_background(s7)
    add_title(s7, "SYSTEM ARCHITECTURE / METHODOLOGY")

    tb = s7.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(8.0), Inches(5.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "Input"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_TEXT

    p_in = tf.add_paragraph()
    p_in.text = "●  The system collects baggage details, flight schedules, conveyor network topology, and cutoff deadlines.\n"
    p_in.font.size = Pt(15)
    p_in.font.color.rgb = RGBColor(50, 50, 50)

    p_pr = tf.add_paragraph()
    p_pr.text = "Processing"
    p_pr.font.size = Pt(17)
    p_pr.font.bold = True
    p_pr.font.color.rgb = C_TEXT

    p_pr_desc = tf.add_paragraph()
    p_pr_desc.text = "●  The collected information is processed to prioritize bags using a 4-tier comparator, compute optimal paths using Dijkstra's algorithm, and verify security clearances.\n"
    p_pr_desc.font.size = Pt(15)
    p_pr_desc.font.color.rgb = RGBColor(50, 50, 50)

    p_db = tf.add_paragraph()
    p_db.text = "Database"
    p_db.font.size = Pt(17)
    p_db.font.bold = True
    p_db.font.color.rgb = C_TEXT

    p_db_desc = tf.add_paragraph()
    p_db_desc.text = "●  The relevant information is stored and retrieved through the database for efficient data management."
    p_db_desc.font.size = Pt(15)
    p_db_desc.font.color.rgb = RGBColor(50, 50, 50)

    # ==========================================
    # SLIDE 8: Continuation / Output
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_slide_background(s8)
    add_title(s8, "SYSTEM ARCHITECTURE / METHODOLOGY (CONTD.)")

    tb = s8.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(8.0), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "●  The system displays baggage routing plans, conveyor network status, and flight bay assignments to support better planning.\n"
    p.font.size = Pt(16)
    p.font.color.rgb = RGBColor(50, 50, 50)

    p2 = tf.add_paragraph()
    p2.text = "Output"
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = C_TEXT

    p3 = tf.add_paragraph()
    p3.text = "●  The system displays dispatch priorities, conveyor failover paths, gate bay status, and real-time passenger tracking to support airport ground handling operations."
    p3.font.size = Pt(16)
    p3.font.color.rgb = RGBColor(50, 50, 50)

    # ==========================================
    # SLIDE 9: PROJECT PLANNING & TIMELINE
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_slide_background(s9)
    add_title(s9, "PROJECT PLANNING & TIMELINE")

    tb = s9.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(8.0), Inches(5.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "REVIEW – 3"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_TEXT

    rev3_points = [
        "Implementation of staff authentication, baggage management, and flight board modules.",
        "Integration of Dijkstra’s shortest-path algorithm and dynamic rerouting failover.",
        "Development of interactive SVG conveyor network mapping and route visualization.",
        "Testing of 4-tier priority dispatch queue, passenger QR tracking, and end-to-end system functionality."
    ]
    for pt in rev3_points:
        p_pt = tf.add_paragraph()
        p_pt.text = f"●  {pt}"
        p_pt.font.size = Pt(15)
        p_pt.font.color.rgb = RGBColor(50, 50, 50)

    # ==========================================
    # SLIDE 10: IMPLEMENTED MODULES
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_slide_background(s10)
    add_title(s10, "IMPLEMENTED MODULES")

    tb = s10.shapes.add_textbox(Inches(1.1), Inches(1.4), Inches(8.2), Inches(5.8))
    tf = tb.text_frame
    tf.word_wrap = True

    modules = [
        ("Staff Authentication: ", "Maintains authorized staff credentials and restricted airside portal access."),
        ("Baggage Management: ", "Records checked-in luggage, passenger categories, and processing status."),
        ("Flight Management: ", "Maintains flight destinations, departure times, and loading bay assignments."),
        ("Conveyor Management: ", "Stores conveyor nodes, belts, travel times, and segment availability status."),
        ("Priority Dispatch: ", "Sequences luggage using a 4-tier comparator (cutoff, transfer, class, arrival)."),
        ("Route Optimization: ", "Calculates the shortest conveyor path using Dijkstra's algorithm."),
        ("Passenger Tracking: ", "Displays a digital boarding luggage tag with live scannable QR code."),
        ("Database Management: ", "Supports organized storage, retrieval, and live inspection of system records.")
    ]

    for i, (head, tail) in enumerate(modules):
        p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
        p.text = f"●  {head}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_TEXT
        run = p.add_run()
        run.text = tail
        run.font.bold = False

    # ==========================================
    # SLIDE 11: DATABASE CONNECTIVITY
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_slide_background(s11)
    add_title(s11, "DATABASE CONNECTIVITY")

    tb = s11.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(8.0), Inches(5.2))
    tf = tb.text_frame
    tf.word_wrap = True

    db_points = [
        "Uses H2 / PostgreSQL for centralized storage of airport logistics information.",
        "Establishes database connectivity through Spring Data JPA & Hibernate.",
        "Stores baggage, flight, conveyor segment, loading bay, and staff records.",
        "Supports insertion, retrieval, and updating of records.",
        "Maintains organized information for apron, security, and sorting operations.",
        "Provides database information required for baggage routing and loading planning."
    ]

    for i, pt in enumerate(db_points):
        p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
        p.text = f"●  {pt}"
        p.font.size = Pt(15)
        p.font.color.rgb = RGBColor(50, 50, 50)

    # ==========================================
    # SLIDE 12: RESULTS
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_slide_background(s12)
    add_title(s12, "RESULTS")

    tb = s12.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(8.0), Inches(5.2))
    tf = tb.text_frame
    tf.word_wrap = True

    res_points = [
        "Developed a web-based airport baggage handling and routing system.",
        "Organized baggage, flight, conveyor segment, and staff information.",
        "Established relational database connectivity through Spring Data JPA.",
        "Implemented shortest-path calculation using Dijkstra's algorithm, verified with 18 automated tests.",
        "Integrated interactive SVG network topology and live passenger QR mobile tracking.",
        "Supported airport shipment planning, priority dispatching, and resource management."
    ]

    for i, pt in enumerate(res_points):
        p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
        p.text = f"●  {pt}"
        p.font.size = Pt(15)
        p.font.color.rgb = RGBColor(50, 50, 50)

    # ==========================================
    # SLIDE 13: Conclusion
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    add_slide_background(s13)
    add_title(s13, "Conclusion")

    tb = s13.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(8.0), Inches(5.0))
    tf = tb.text_frame
    tf.word_wrap = True

    concl_points = [
        "Simplifies airport baggage record management through a centralized digital platform.",
        "Improves coordination between check-in desks, security screening, and aircraft loading bays.",
        "Supports shortest-route calculation, dynamic rerouting, and conveyor visualization.",
        "Provides a foundation for organized airport baggage dispatch and flight delay prevention."
    ]

    for i, pt in enumerate(concl_points):
        p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
        p.text = f"●  {pt}"
        p.font.size = Pt(16)
        p.font.color.rgb = RGBColor(50, 50, 50)

    # ==========================================
    # SLIDE 14: REFERENCES
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    add_slide_background(s14)
    add_title(s14, "REFERENCES")

    tb = s14.shapes.add_textbox(Inches(1.1), Inches(1.4), Inches(8.3), Inches(5.6))
    tf = tb.text_frame
    tf.word_wrap = True

    refs = [
        ("[1] E. W. Dijkstra, “A note on two problems in connexion with graphs,” Numerische Mathematik, vol. 1, pp. 269–271, 1959. [Online]. Available: ", "https://link.springer.com/article/10.1007/BF01386390"),
        ("[2] Oracle, “Java Platform, Standard Edition Documentation (Java 21),” Oracle. [Online]. Available: ", "https://docs.oracle.com/en/java/javase/21/docs/api/"),
        ("[3] Spring Boot Team, “Spring Boot Reference Documentation (v3.3.4),” VMware Tanzu. [Online]. Available: ", "https://docs.spring.io/spring-boot/"),
        ("[4] Mozilla, “Web Technology for Developers (React & TypeScript),” MDN Web Docs. [Online]. Available: ", "https://developer.mozilla.org/en-US/docs/Web"),
        ("[5] H2 Database Engine, “H2 Database Engine Reference Manual,” [Online]. Available: ", "https://www.h2database.com/html/main.html")
    ]

    for i, (prefix, link) in enumerate(refs):
        p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
        p.text = f"{i+1}.  {prefix}"
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT

        run = p.add_run()
        run.text = link
        run.font.color.rgb = RGBColor(0, 102, 204)
        run.font.underline = True

    # ==========================================
    # SLIDE 15: Work Plan (Table)
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    add_slide_background(s15)
    add_title(s15, "Work Plan")

    # Table layout: 5 rows, 2 columns
    table_shape = s15.shapes.add_table(5, 2, Inches(1.3), Inches(1.6), Inches(7.8), Inches(5.2))
    table = table_shape.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(5.6)

    headers = ["Review", "Work to be carried out"]
    data = [
        ("ZEROTH\nREVIEW", "Problem identification and project planning."),
        ("FIRST\nREVIEW", "Initial project modules, graph representations, and data structures."),
        ("SECOND\nREVIEW", "●  Frontend web application development.\n●  Database connectivity.\n●  Data storage and retrieval."),
        ("THIRD\nREVIEW", "●  Final testing and validation.\n●  Complete remaining features (QR tracking & failover).\n●  Documentation and report preparation.")
    ]

    # Style header
    for col_idx, htext in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(46, 80, 119)  # Slate navy header
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        cp = cell.text_frame.paragraphs[0]
        cp.text = htext
        cp.font.size = Pt(15)
        cp.font.bold = True
        cp.font.color.rgb = C_WHITE
        cp.alignment = PP_ALIGN.CENTER

    # Style data rows
    for row_idx, (rname, rwork) in enumerate(data, start=1):
        cell_rev = table.cell(row_idx, 0)
        cell_rev.vertical_anchor = MSO_ANCHOR.MIDDLE
        crp = cell_rev.text_frame.paragraphs[0]
        crp.text = rname
        crp.font.size = Pt(13)
        crp.font.bold = True
        crp.font.color.rgb = C_TEXT
        crp.alignment = PP_ALIGN.CENTER

        cell_work = table.cell(row_idx, 1)
        cell_work.vertical_anchor = MSO_ANCHOR.MIDDLE
        cwp = cell_work.text_frame.paragraphs[0]
        cwp.text = rwork
        cwp.font.size = Pt(13)
        cwp.font.color.rgb = RGBColor(40, 40, 40)

    # ==========================================
    # SLIDE 16: THANK YOU
    # ==========================================
    s16 = prs.slides.add_slide(blank_layout)
    add_slide_background(s16)

    # Thank you note card
    card = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.2), Inches(2.2), Inches(4.5), Inches(3.4))
    card.fill.solid()
    card.fill.fore_color.rgb = RGBColor(248, 250, 252)
    card.line.color.rgb = RGBColor(200, 210, 220)

    # Red pin on the card
    pin = s16.shapes.add_shape(MSO_SHAPE.OVAL, Inches(5.25), Inches(2.4), Inches(0.4), Inches(0.4))
    pin.fill.solid()
    pin.fill.fore_color.rgb = RGBColor(220, 38, 38)
    pin.line.fill.background()

    ctf = card.text_frame
    ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
    cp1 = ctf.paragraphs[0]
    cp1.text = "\n\nTHANK\nYOU"
    cp1.font.name = "Arial"
    cp1.font.size = Pt(40)
    cp1.font.bold = True
    cp1.font.color.rgb = RGBColor(30, 41, 59)
    cp1.alignment = PP_ALIGN.CENTER

    out_path = "c:\\Users\\athis\\OneDrive\\Desktop\\Airport Baggage Routing System\\Airport_Baggage_Routing_System_Review2.pptx"
    prs.save(out_path)
    print(f"Presentation saved successfully to {out_path}")

if __name__ == '__main__':
    create_deck()
