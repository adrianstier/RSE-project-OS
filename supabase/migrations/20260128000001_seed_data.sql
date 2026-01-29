-- RSE (Restoration Strategy Evaluation) Seed Data
-- Run this after schema.sql to populate the database with sample data

-- ============================================
-- MOTE SCENARIOS
-- ============================================

INSERT INTO scenarios (title, description, project, status, priority, data_status) VALUES

-- Mote Scenario 1: Facilitation Strategy (Flagship)
(
    'Facilitation Strategy Under Mixed Disturbance',
    'Compare allocation across heat vs. physical disturbance regimes. Decision question: Should we outplant Diploria under gorgonian canopy (heat protection) or with A. cervicornis (physical protection)? Gorgonians shade against heat but vulnerable to hurricanes; ACER provides ~70% survival increase (fish predation) but is itself disturbance-prone. RSE exploration includes varying heat wave x hurricane frequency, optimal allocation across disturbance space, and hedged portfolio minimizing worst-case. This is Jameal''s flagship idea and Jason''s primary interest.',
    'mote',
    'planning',
    'high',
    'data-pending'
),

-- Mote Scenario 2: Genotype Portfolio
(
    'Genotype Portfolio Under Uncertainty',
    'Decision question: Concentrated bet (top 10 thermally tolerant) vs. diversified (50+ genets)? ~160 wild APAL founding genets. Classic portfolio problem. May require eco-evo dynamics component. Data needs: Genotype x stress response matrix from Aaron Muller, field performance by genotype x site from Logan Merion.',
    'mote',
    'planning',
    'medium',
    'data-partial'
),

-- Mote Scenario 3: Nursery vs Field
(
    'Nursery vs. Field Allocation During Recovery',
    'Decision question: Post-2023, deploy fragments right away or keep in lab longer? Rebuilding APAL from near-zero after pathogen event. Tension between field testing and maintaining backup. Most immediately tractable scenario - data exists, decision happening now.',
    'mote',
    'planning',
    'medium',
    'data-ready'
);

-- ============================================
-- FUNDEMAR SCENARIOS
-- ============================================

INSERT INTO scenarios (title, description, project, status, priority, data_status) VALUES

-- Fundemar Scenario 1: Outplanting Allocations
(
    'Outplanting Allocations',
    'Decision question: What proportion of substrates should go to orchard vs. reef? Long-term goal: reproductive orchards as baby coral source. Need to grow orchards (no adults yet) while continuing reef outplanting. Key parameters: survival/growth rates (orchard vs. reef), disturbance impacts (orchard vs. reef), costs (orchard maintenance, spawn collection). Results matched Fundemar''s intuition - short horizons (5-10 yr) favor reef deployment; long horizons (50-100 yr) favor orchard for reproductive capacity.',
    'fundemar',
    'active',
    'high',
    'data-partial'
),

-- Fundemar Scenario 2: Lab Grow-out
(
    'Lab Grow-out',
    'Decision question: How many substrates kept in lab vs. immediately outplanted? Testing 4-7 month grow-out with feeding. Expect better post-outplanting survival but higher costs + aquarium failure risk. Modeling note: Annual timestep requires approximation - immediate = current timestep, longer grow-out = following timestep with modified survival/size.',
    'fundemar',
    'planning',
    'medium',
    'data-pending'
),

-- Fundemar Scenario 3: Substrate Choice
(
    'Substrate Choice',
    'Decision question: What proportion ceramic vs. cement? Trade-offs: Cement is cheaper with higher settlement but lower survival. Ceramic is expensive with lower settlement but higher survival.',
    'fundemar',
    'planning',
    'medium',
    'data-partial'
),

-- Fundemar Scenario 4: Orchard Use
(
    'Orchard Use',
    'Decision question: Use orchard corals for spawning or transplant directly to reefs? Survival increases with colony size. If recruit survival is low, large orchard corals might contribute more via direct transplant than spawning.',
    'fundemar',
    'planning',
    'medium',
    'data-pending'
);

-- ============================================
-- MOTE ACTION ITEMS
-- ============================================

-- Get the scenario IDs for linking action items
-- Note: In practice, you would use the actual UUIDs from the inserted scenarios

INSERT INTO action_items (title, description, owner, status, due_date, project) VALUES

-- Mote action items
(
    'Schedule follow-up with Jason',
    'Week of 2/9. Highest priority: identify which scenarios to focus on. Available times: 2/9 9-10am, 2/10 12-2pm, 2/11 9-10am or 12:30-2:30.',
    'TNC',
    'todo',
    '2026-02-09',
    'mote'
),
(
    'Start DLAB data search',
    'Start with Pete Edmonds'' St. John model. Make spreadsheet of what we have vs. need for DLAB parameters.',
    'Raine',
    'todo',
    '2026-02-15',
    'mote'
),
(
    'Draft concept note for Jason',
    '1-2 pages: model structure, candidate scenarios, parameter wishlist. Have ready for 2/9 call.',
    'Adrian',
    'todo',
    '2026-02-09',
    'mote'
),
(
    'Scope initial data request',
    'APAL + DLAB survival rates, genetic data from Aaron Muller and Logan Merion. Be specific about minimum vs. nice-to-have.',
    'Raine',
    'todo',
    '2026-02-15',
    'mote'
);

-- ============================================
-- FUNDEMAR ACTION ITEMS
-- ============================================

INSERT INTO action_items (title, description, owner, status, due_date, project) VALUES

-- Waiting on Fundemar items
(
    'Cost data from Fundemar',
    'Requested Jan 23. Need cost breakdown for orchard maintenance vs. reef deployment.',
    'Fundemar',
    'blocked',
    NULL,
    'fundemar'
),
(
    'Lab vs. orchard growth + survival data',
    'Expected in ~1 month. Critical for Lab Grow-out and Orchard Use scenarios.',
    'Fundemar',
    'blocked',
    '2026-02-28',
    'fundemar'
),
(
    '2025 annual report',
    'Received from Maria. Need to distribute to Adrian, Jameal, Darcy.',
    'Maria',
    'done',
    NULL,
    'fundemar'
),

-- Model development items
(
    'Update scenario analyses',
    'Orchard expansion, spawn source, 5 yr vs. 100 yr effects analysis.',
    'Raine',
    'todo',
    '2026-03-15',
    'fundemar'
),
(
    'Add performance metrics',
    'Time to reproduction, reef function beyond coral cover.',
    'Raine',
    'todo',
    '2026-03-31',
    'fundemar'
),
(
    'Run local vs. regional parameterization',
    'Compare model outputs using Fundemar-specific parameters vs. Caribbean regional averages.',
    'Raine',
    'todo',
    '2026-04-15',
    'fundemar'
),
(
    'Build DLAB model',
    'Start with Pete Edmonds'' data. Shared foundation with Mote DLAB work.',
    'Raine',
    'todo',
    '2026-04-30',
    'fundemar'
),
(
    'Summarize annual report',
    'Extract key data points and distribute summary to Adrian, Jameal, Darcy.',
    'Raine',
    'in_progress',
    '2026-02-07',
    'fundemar'
);

-- ============================================
-- GENERAL ACTION ITEMS (Phase 3)
-- ============================================

INSERT INTO action_items (title, description, owner, status, due_date, project) VALUES
(
    'Decide operationalization approach',
    'Darcy''s concern: disconnect between useful approach and actual use for decision-making. Options: Shiny v2 or something else?',
    'All',
    'todo',
    '2026-03-31',
    NULL
);

-- ============================================
-- TIMELINE EVENTS
-- ============================================

INSERT INTO timeline_events (title, description, event_date, event_type, project) VALUES

-- Past events
(
    'Fundemar call',
    'Initial scenario scoping call with Fundemar team.',
    '2026-01-21',
    'meeting',
    'fundemar'
),
(
    'Mote call',
    'Initial scenario scoping call with Mote. Cost data request sent.',
    '2026-01-23',
    'meeting',
    'mote'
),
(
    'Annual report received',
    'Fundemar 2025 annual report received from Maria.',
    '2026-01-27',
    'deliverable',
    'fundemar'
),
(
    'RSE Team Check-in',
    'Adrian, Raine, Jameal, Darcy meeting to debrief Fundemar and Mote calls.',
    '2026-01-28',
    'meeting',
    NULL
),

-- Upcoming events
(
    'Mote follow-up call',
    'Follow-up with Jason. Potential times: 2/9 9-10am, 2/10 12-2pm, 2/11 9-10am or 12:30-2:30.',
    '2026-02-09',
    'meeting',
    'mote'
),
(
    'Lab vs. orchard data expected',
    'Fundemar lab vs. orchard growth and survival data expected.',
    '2026-02-28',
    'deliverable',
    'fundemar'
),

-- Major milestones
(
    'Current contract ends',
    'End of current RSE Phase 2 contract period.',
    '2026-05-31',
    'deadline',
    NULL
),
(
    'Raine TNC funding ends',
    'End of Raine''s TNC funding. Goal: Fundemar wrapped, Mote foundation set.',
    '2026-05-31',
    'deadline',
    NULL
),
(
    'Fundemar wrap-up target',
    'Target date to have Fundemar RSE work substantially complete.',
    '2026-05-31',
    'milestone',
    'fundemar'
),
(
    'Mote foundation target',
    'Target date to have Mote RSE foundation established.',
    '2026-05-31',
    'milestone',
    'mote'
),

-- Phase 3
(
    'Phase 3 start',
    'Begin RSE Phase 3. $150K budget, 18 months. MARS = majority of work.',
    '2026-06-01',
    'milestone',
    NULL
);
